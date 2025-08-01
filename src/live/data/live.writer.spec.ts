import { afterAll, beforeEach, describe, it, expect } from 'vitest';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { GradeService } from '../../channel/service/grade.service.js';
import { mockChannelAppend } from '../../channel/spec/channel.dto.schema.mocks.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { mockLiveInfoChzzk } from '../../platform/spec/wapper/live.mocks.js';
import { DevInitializer } from '../../common/init/dev-initializer.js';
import { dropTables } from '../../infra/db/utils.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { LiveCreateArgs, LiveWriter } from './live.writer.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { LiveFinder } from './live.finder.js';
import assert from 'assert';

const app = await createTestApp();
const init = app.get(DevInitializer);
const pfFinder = app.get(PlatformFinder);
const grService = app.get(GradeService);
const liveWriter = app.get(LiveWriter);
const liveFinder = app.get(LiveFinder);
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
    const gr = await grService.findByNameNotNull('none');

    const cha = mockChannelAppend({ platformId: pf.id, gradeId: gr.id });
    const ch = await chWriter.createWithTagNames(cha, ['tag1', 'tag2']);

    const li1 = mockLiveInfoChzzk({ channelId: ch.sourceId });
    const args1: LiveCreateArgs = {
      liveInfo: li1,
      fields: {
        channelId: ch.id,
        isDisabled: false,
        domesticOnly: false,
        overseasFirst: false,
        liveStreamId: null,
      },
    };
    const live1 = await liveWriter.createByLiveInfo(args1);
    expect(live1.liveTitle).toBe(li1.liveTitle);

    const li2 = mockLiveInfoChzzk({ channelId: ch.sourceId });
    await liveWriter.updateByLive(live1.id, li2);
    const live2 = await liveFinder.findById(live1.id);
    assert(live2);
    expect(live2.liveTitle).not.toBe(live1.liveTitle);
    expect(live2.liveTitle).toBe(li2.liveTitle);

    await expect(() => {
      const args2 = { ...args1 };
      args2.liveInfo = mockLiveInfoChzzk({ channelId: ch.sourceId });
      args2.fields.videoName = live1.videoName;
      return liveWriter.createByLiveInfo(args2);
    }).rejects.toThrowError(ConflictError);

    const copied = await liveWriter.createByLive(live2.id);
    expect(copied.id).not.toBe(live2.id);
    expect(copied.createdAt).not.toBe(live2.createdAt);
  });
});
