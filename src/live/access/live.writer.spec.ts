import { describe, it, beforeEach, afterAll } from 'vitest';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { DevInitializer } from '../../common/module/dev-initializer.js';
import { dropAll } from '../../infra/db/utils.js';
import { LiveWriter } from './live.writer.js';
import { mockLiveInfo } from '../../common/helpers/live.mocks.js';
import { NodeWriter } from '../../node/service/node.writer.js';
import { notNull } from '../../utils/null.js';
import { mockNode } from '../../common/helpers/node.mocks.js';
import { NodeGroupRepository } from '../../node/storage/node-group.repository.js';
import { mockChannel } from '../../common/helpers/channel.mocks.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { PriorityService } from '../../channel/service/priority.service.js';

const app = await createTestApp();
const init = app.get(DevInitializer);
const pfFinder = app.get(PlatformFinder);
const priService = app.get(PriorityService);
const ngRepo = app.get(NodeGroupRepository);
const nodeWriter = app.get(NodeWriter);
const liveWriter = app.get(LiveWriter);
const chWriter = app.get(ChannelWriter);

describe('ChannelService', () => {
  beforeEach(async () => {
    await init.initDev();
  });

  afterAll(async () => {
    await dropAll();
  });

  it('create', async () => {
    const ng = notNull(await ngRepo.findByName('main'));
    const node = await nodeWriter.create(mockNode(1, ng.id), true);
    const pf = await pfFinder.findByNameNotNull('chzzk');
    const pri = await priService.findByNameNotNull('none');
    const ch = await chWriter.createWithTagNames(mockChannel(1, pf, pri), ['tag1', 'tag2']);
    const live1 = await liveWriter.createByLive(mockLiveInfo(1, ch.pid), node.id);
    console.log(live1);

    const live2 = await liveWriter.updateByLive(live1.id, mockLiveInfo(2, ch.pid));
    console.log(live2);
  });
});
