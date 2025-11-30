import { faker } from '@faker-js/faker';
import { TestingModule } from '@nestjs/testing';
import assert from 'assert';
import { beforeAll, describe, it } from 'vitest';

import { subLists } from '@/utils/list.js';

import { newTestingModuleRef } from '@/common/helpers/helper.app.js';
import { DevInitializer } from '@/common/init/dev-initializer.js';

import { dropTables } from '@/infra/db/utils.js';

import { PlatformFinder } from '@/platform/storage/platform.finder.js';

import { GradeService } from '@/channel/service/grade.service.js';
import { dummyChannelEntAppend } from '@/channel/spec/channel.dto.schema.dummy.js';
import { ChannelCommandRepository } from '@/channel/storage/channel.command.js';
import { ChannelSearchRepository, ChannelTagSearchRequest } from '@/channel/storage/channel.search.js';
import { TagCommandRepository } from '@/channel/storage/tag.command.js';

describe.skip('ChannelSearchRepository perf', () => {
  let moduleRef: TestingModule;
  let init: DevInitializer;
  let pfFinder: PlatformFinder;
  let grService: GradeService;
  let tagCmd: TagCommandRepository;
  let chanCmd: ChannelCommandRepository;
  let chSearchRepo: ChannelSearchRepository;

  beforeAll(async () => {
    moduleRef = await newTestingModuleRef();
    init = moduleRef.get(DevInitializer);
    pfFinder = moduleRef.get(PlatformFinder);
    grService = moduleRef.get(GradeService);
    tagCmd = moduleRef.get(TagCommandRepository);
    chanCmd = moduleRef.get(ChannelCommandRepository);
    chSearchRepo = moduleRef.get(ChannelSearchRepository);
  });

  it('drop', async () => {
    await dropTables();
  });

  it('set', async () => {
    const tagSize = 100;
    // const chanSize = 10;
    const chanSize = 10000;
    const parallelSize = 5;
    const parallelBindWeight = 10;
    const batchSize = 100;
    const maxChanTagSize = 40;

    await init.initDev(false);

    const great = (await grService.findByNameNotNull('great'))?.id;
    const nice = (await grService.findByNameNotNull('nice'))?.id;
    const good = (await grService.findByNameNotNull('good'))?.id;

    const chzzk = (await pfFinder.findByName('chzzk'))?.id;
    const soop = (await pfFinder.findByName('soop'))?.id;
    assert(chzzk);
    assert(soop);

    const priIds = [great, nice, good];
    const pfIds = [chzzk, soop];

    const tagNames = Array.from({ length: tagSize }, (_, idx) => `tag${idx}`);
    const tagIds = await tagCmd.createBatch(tagNames.map((tagName) => ({ name: tagName })));

    const channelIndices = Array.from({ length: chanSize }, (_, idx) => idx);
    const channelIds: string[] = [];
    for (const parallelChannelIndices of subLists(channelIndices, parallelSize * batchSize)) {
      const ps = [];
      for (const batchNums of subLists(parallelChannelIndices, batchSize)) {
        const appends = batchNums.map((n) => chanReq(n, maxChanTagSize, tagIds, priIds, pfIds));
        ps.push(chanCmd.createBatch(appends));
      }
      for (const batchChannelIds of await Promise.all(ps)) {
        for (const channelId of batchChannelIds) {
          channelIds.push(channelId);
        }
      }
    }

    for (const parallelChannelIds of subLists(channelIds, parallelSize * parallelBindWeight)) {
      const ps = [];
      for (const channelId of parallelChannelIds) {
        let copied = [...tagIds];
        const tgtTagIds = [];
        const chanTagSize = faker.number.int({ min: 1, max: maxChanTagSize });
        for (let i = 0; i < chanTagSize; i++) {
          const tgtTagId = faker.helpers.arrayElement(copied);
          tgtTagIds.push(tgtTagId);
          copied = copied.filter((tagName) => tagName !== tgtTagId);
        }
        const p = tagCmd.bindBatch(tgtTagIds.map((tid) => ({ channelId: channelId, tagId: tid })));
        ps.push(p);
      }
      await Promise.all(ps);
    }
  });

  it('test', async () => {
    // const sortBy = 'createdAt';
    const sortBy = 'followerCnt';

    // const gradeName = 'should';
    const gradeName = undefined;

    const includeTagNames = ['tag4', 'tag5', 'tag10'];
    // const excludeTagNames = ['tag10', 'tag11', 'tag12', 'tag13', 'tag14', 'tag15', 'tag16', 'tag17', 'tag18'];
    const excludeTagNames = Array.from({ length: 10 }, (_, idx) => `tag${idx + 30}`);

    const startTime = Date.now();

    const req: ChannelTagSearchRequest = {
      page: { page: 1, size: 20 },
      sortBy,
      gradeName: gradeName,
      includeTagNames,
      excludeTagNames,
      withTotal: false,
    };
    const result = await chSearchRepo.findByTags(req);
    // const result = await chSearchRepo.findByTagsLegacy(req);

    console.log(`Duration: ${Date.now() - startTime}ms`);
    console.log(result.channels.map((r) => r.username));
  });
});

function chanReq(n: number, maxTagNum: number, tagIds: string[], priIds: string[], pfIds: string[]) {
  return dummyChannelEntAppend({
    sourceId: `uid${n}`,
    username: `user${n}`,
    isFollowed: false,
    platformId: faker.helpers.arrayElement(pfIds),
    gradeId: faker.helpers.arrayElement(priIds),
    followerCnt: faker.number.int({ min: 0, max: 100000 }),
  });
}
