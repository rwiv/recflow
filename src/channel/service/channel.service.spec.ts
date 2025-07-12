import { afterAll, describe, it } from 'vitest';
import { mockChannelAppend } from '../spec/channel.dto.schema.mocks.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { DevInitializer } from '../../common/init/dev-initializer.js';
import { dropTables } from '../../infra/db/utils.js';
import { ChannelFinder } from './channel.finder.js';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelWriter } from './channel.writer.js';
import { PriorityService } from './priority.service.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { ChannelSearchRepository } from '../storage/channel.search.js';
import assert from 'assert';

const app = await createTestApp();
const init = app.get(DevInitializer);
const pfFinder = app.get(PlatformFinder);
const priService = app.get(PriorityService);
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
    const great = (await priService.findByNameNotNull('great'))?.id;
    const nice = (await priService.findByNameNotNull('nice'))?.id;
    const good = (await priService.findByNameNotNull('good'))?.id;
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

    // const sortedBy = 'createdAt';
    const sortedBy = 'followerCnt';

    // const prioirty = 'should';
    const prioirty = undefined;

    const includes = ['tag4', 'tag5'];
    // const excludes: string[] = [];
    const excludes = ['tag10', 'tag12'];
    // const excludes = ['tag10', 'tag12'];
    // const excludes = ['tag3', 'tag6'];

    const page = { page: 1, size: 20 };

    // const result = await chSearcher.findByQuery(page, sorted, prioirty, undefined, true);
    const result = await chSearchRepo.findByAllTags(includes, excludes, page, sortedBy, prioirty);
    // const result = await chSearchRepo.findByAllTags2(includes, excludes, page, sortedBy, prioirty, false);
    // const result = await chSearcher.findByAnyTag(includes, excludes, page, sorted, prioirty, true);
    console.log(result.total);
    console.log(result.channels.map((r) => r.username));
    console.log(result.channels.map((r) => r.followerCnt));

    const all = await chMapper.loadRelations(await chFinder.findAll(), { tags: true });
    for (const r of all) {
      console.log(`${r.username}: [${r.tags?.map((t) => t.name).join(',')}]`);
    }
  });
});

function add(n: number, priorityId: string, platformId: string, followerCnt: number, tagNames: string[]) {
  const ch = mockChannelAppend({
    pid: `pid${n}`,
    username: `user${n}`,
    priorityId,
    followerCnt,
    platformId,
  });
  return chWriter.createWithTagNames(ch, tagNames);
}
