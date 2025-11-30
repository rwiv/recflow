import { TestingModule } from '@nestjs/testing';
import assert from 'assert';
import { afterAll, beforeAll, describe, it } from 'vitest';

import { newTestingModuleRef } from '@/common/helpers/helper.app.js';
import { DevInitializer } from '@/common/init/dev-initializer.js';

import { dropTables } from '@/infra/db/utils.js';

import { PlatformFinder } from '@/platform/storage/platform.finder.js';

import { ChannelFinder } from '@/channel/service/channel.finder.js';
import { ChannelMapper } from '@/channel/service/channel.mapper.js';
import { ChannelWriter } from '@/channel/service/channel.writer.js';
import { GradeService } from '@/channel/service/grade.service.js';
import { dummyChannelAppend } from '@/channel/spec/channel.dto.schema.dummy.js';
import { ChannelSearchRepository, ChannelTagSearchRequest } from '@/channel/storage/channel.search.js';

describe.skip('ChannelSearchRepository', () => {
  let moduleRef: TestingModule;
  let init: DevInitializer;
  let pfFinder: PlatformFinder;
  let grService: GradeService;
  let chFinder: ChannelFinder;
  let chSearchRepo: ChannelSearchRepository;
  let chWriter: ChannelWriter;
  let chMapper: ChannelMapper;

  beforeAll(async () => {
    moduleRef = await newTestingModuleRef();
    init = moduleRef.get(DevInitializer);
    pfFinder = moduleRef.get(PlatformFinder);
    grService = moduleRef.get(GradeService);
    chFinder = moduleRef.get(ChannelFinder);
    chSearchRepo = moduleRef.get(ChannelSearchRepository);
    chWriter = moduleRef.get(ChannelWriter);
    chMapper = moduleRef.get(ChannelMapper);
  });

  afterAll(async () => {
    await dropTables();
  });

  it('findPage', async () => {
    await dropTables();
    await init.initDev(false);
    const great = (await grService.findByNameNotNull('great'))?.id;
    const nice = (await grService.findByNameNotNull('good'))?.id;
    const review = (await grService.findByNameNotNull('review'))?.id;
    const chzzk = (await pfFinder.findByName('chzzk'))?.id;
    assert(chzzk);

    for (let i = 1; i <= 15; i++) {
      if (i <= 5) {
        await add(i, great, chzzk, 100 - i, ['tag1', 'tag2']);
      } else if (i <= 10) {
        await add(i, great, chzzk, 100 - i, ['tag2', 'tag3']);
      } else {
        await add(i, great, chzzk, 100 - i, ['tag3', 'tag4']);
      }
    }
    for (let i = 16; i <= 30; i++) {
      if (i <= 20) {
        await add(i, nice, chzzk, 100 - i, ['tag4', 'tag5', 'tag10', 'tag11']);
      } else if (i <= 25) {
        await add(i, nice, chzzk, 100 - i, ['tag4', 'tag5']);
      } else {
        await add(i, review, chzzk, 100 - i, ['tag4', 'tag5', 'tag12', 'tag13']);
      }
    }

    // const sortBy = 'createdAt';
    const sortBy = 'followerCnt';

    // const gradeName = 'should';
    const gradeName = undefined;

    const includeTagNames = ['tag4', 'tag5'];
    // const excludeTagNames: string[] = [];
    const excludeTagNames = ['tag10', 'tag12'];

    const req: ChannelTagSearchRequest = {
      page: { page: 1, size: 20 },
      sortBy,
      gradeName: gradeName,
      includeTagNames,
      excludeTagNames,
      withTotal: false,
    };
    // const result = await chSearcher.findByQuery(req);
    const result = await chSearchRepo.findByTags(req);
    // const result = await chSearchRepo.findByTagsLegacy(req);
    console.log(result.channels.map((r) => r.username));
    console.log(result.channels.map((r) => r.followerCnt));

    const all = await chMapper.loadRelations(await chFinder.findAll(), { tags: true });
    for (const r of all) {
      console.log(`${r.username}: [${r.tags?.map((t) => t.name).join(',')}]`);
    }
  });

  function add(n: number, gradeId: string, platformId: string, followerCnt: number, tagNames: string[]) {
    const ch = dummyChannelAppend({
      sourceId: `uid${n}`,
      username: `user${n}`,
      gradeId,
      followerCnt,
      platformId,
    });
    return chWriter.createWithTagNames(ch, tagNames);
  }
});
