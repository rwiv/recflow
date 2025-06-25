import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { mockChannelAppend } from '../spec/channel.dto.schema.mocks.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { DevInitializer } from '../../common/init/dev-initializer.js';
import { dropTables } from '../../infra/db/utils.js';
import { PlatformDto } from '../../platform/spec/storage/platform.dto.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { PriorityDto } from '../spec/priority.schema.js';
import { ChannelFinder } from './channel.finder.js';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelSearcher } from './channel.searcher.js';
import { ChannelWriter } from './channel.writer.js';
import { PriorityService } from './priority.service.js';

const app = await createTestApp();
const init = app.get(DevInitializer);
const pfFinder = app.get(PlatformFinder);
const priService = app.get(PriorityService);
const chFinder = app.get(ChannelFinder);
const chSearcher = app.get(ChannelSearcher);
const chWriter = app.get(ChannelWriter);
const chMapper = app.get(ChannelMapper);

describe('ChannelService', () => {
  let pf: PlatformDto | undefined = undefined;
  let must: PriorityDto | undefined = undefined;
  let should: PriorityDto | undefined = undefined;
  let may: PriorityDto | undefined = undefined;
  beforeEach(async () => {
    await init.initDev();
    pf = await pfFinder.findByNameNotNull('chzzk');
    must = await priService.findByNameNotNull('must');
    should = await priService.findByNameNotNull('should');
    may = await priService.findByNameNotNull('may');
  });

  afterAll(async () => {
    await dropTables();
  });

  function add(n: number, priority: PriorityDto, followerCnt: number, tagNames: string[]) {
    const ch = mockChannelAppend({
      pid: `asd${n}`,
      username: `asd${n}`,
      priorityId: priority?.id,
      followerCnt,
    });
    return chWriter.createWithTagNames(ch, tagNames);
  }

  it('create', async () => {
    const channel = await chWriter.createWithTagNames(mockChannelAppend(), ['tag1', 'tag2']);
    expect(channel.id).toBeDefined();
    expect(channel.tags).toHaveLength(2);
  });

  it('delete', async () => {
    const channel = await chWriter.createWithTagNames(mockChannelAppend(), ['tag1', 'tag2']);
    await chWriter.delete(channel.id);
    expect(await chFinder.findById(channel.id)).toBeUndefined();
  });

  it('findPage', async () => {
    for (let i = 1; i <= 15; i++) {
      if (i <= 5) {
        await add(i, must, 100 - i, ['tag1', 'tag2']);
      } else if (i <= 10) {
        await add(i, must, 100 - i, ['tag2', 'tag3']);
      } else {
        await add(i, must, 100 - i, ['tag3', 'tag4']);
      }
    }
    for (let i = 16; i <= 30; i++) {
      if (i <= 20) {
        await add(i, should, 100 - i, ['tag4', 'tag5', 'tag10', 'tag11']);
      } else if (i <= 25) {
        await add(i, should, 100 - i, ['tag4', 'tag5']);
      } else {
        await add(i, may, 100 - i, ['tag4', 'tag5', 'tag12', 'tag13']);
      }
    }

    // const sorted = 'createdAt';
    const sorted = 'followerCnt';

    // const prioirty = 'should';
    const prioirty = undefined;

    const includes = ['tag4', 'tag5'];
    // const excludes: string[] = [];
    const excludes = ['tag10', 'tag12'];
    // const excludes = ['tag10', 'tag12'];
    // const excludes = ['tag3', 'tag6'];

    const page = { page: 1, size: 20 };

    // const result = await chSearcher.findByQuery(page, sorted, prioirty, undefined, true);
    const result = await chSearcher.findByAllTags(includes, excludes, page, sorted, prioirty, { tags: true });
    // const result = await chSearcher.findByAnyTag(includes, excludes, page, sorted, prioirty, true);
    console.log(result.total);
    console.log(result.channels.map((r) => r.username));

    const all = await chMapper.loadRelations(await chFinder.findAll(), { tags: true });
    for (const r of all) {
      console.log(`${r.username}: [${r.tags?.map((t) => t.name).join(',')}]`);
    }
  });
});
