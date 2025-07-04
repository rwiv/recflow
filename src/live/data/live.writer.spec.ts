import { afterAll, beforeEach, describe, it } from 'vitest';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { PriorityService } from '../../channel/service/priority.service.js';
import { mockChannelAppend } from '../../channel/spec/channel.dto.schema.mocks.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { mockLiveInfoChzzk } from '../../platform/spec/wapper/live.mocks.js';
import { DevInitializer } from '../../common/init/dev-initializer.js';
import { dropTables } from '../../infra/db/utils.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { LiveCreateOptions, LiveWriter } from './live.writer.js';

const app = await createTestApp();
const init = app.get(DevInitializer);
const pfFinder = app.get(PlatformFinder);
const priService = app.get(PriorityService);
const liveWriter = app.get(LiveWriter);
const chWriter = app.get(ChannelWriter);

describe('ChannelService', () => {
  beforeEach(async () => {
    await init.initDev();
  });

  afterAll(async () => {
    await dropTables();
  });

  it('create', async () => {
    const pf = await pfFinder.findByNameNotNull('chzzk');
    const pri = await priService.findByNameNotNull('none');
    const ch = await chWriter.createWithTagNames(mockChannelAppend({ platformId: pf.id, priorityId: pri.id }), [
      'tag1',
      'tag2',
    ]);
    const opts: LiveCreateOptions = { isDisabled: false, domesticOnly: false, overseasFirst: false };
    const live1 = await liveWriter.createByLive(mockLiveInfoChzzk({ channelId: ch.pid }), null, null, opts);
    console.log(live1);

    const live2 = await liveWriter.updateByLive(live1.id, mockLiveInfoChzzk({ channelId: ch.pid }));
    console.log(live2);
  });
});
