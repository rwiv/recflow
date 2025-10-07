import { afterAll, describe, it } from 'vitest';
import { dummyChannelAppend } from '../spec/channel.dto.schema.dummy.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { DevInitializer } from '../../common/init/dev-initializer.js';
import { dropTables } from '../../infra/db/utils.js';
import { ChannelFinder } from './channel.finder.js';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelWriter } from './channel.writer.js';
import { GradeService } from './grade.service.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { ChannelSearchRepository, ChannelTagSearchRequest } from '../storage/channel.search.js';
import assert from 'assert';

const app = await createTestApp();
const init = app.get(DevInitializer);
const pfFinder = app.get(PlatformFinder);
const grService = app.get(GradeService);
const chFinder = app.get(ChannelFinder);
const chSearchRepo = app.get(ChannelSearchRepository);
const chWriter = app.get(ChannelWriter);
const chMapper = app.get(ChannelMapper);

describe('ChannelService', () => {
  afterAll(async () => {
    await dropTables();
  });

  it('findPage', async () => {
    await dropTables();
    await init.initDev(false);
    const great = (await grService.findByNameNotNull('great'))?.id;
    const nice = (await grService.findByNameNotNull('nice'))?.id;
    const good = (await grService.findByNameNotNull('good'))?.id;
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
        await add(i, good, chzzk, 100 - i, ['tag4', 'tag5', 'tag12', 'tag13']);
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
    console.log(result.total);
    console.log(result.channels.map((r) => r.username));
    console.log(result.channels.map((r) => r.followerCnt));

    const all = await chMapper.loadRelations(await chFinder.findAll(), { tags: true });
    for (const r of all) {
      console.log(`${r.username}: [${r.tags?.map((t) => t.name).join(',')}]`);
    }
  });
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
