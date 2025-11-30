import { Module } from '@nestjs/common';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelServiceModule } from '@/channel/service/channel.service.module.js';
import { ChannelStorageModule } from '@/channel/storage/channel.storage.module.js';

import { LiveStorageModule } from '@/live/storage/live.storage.module.js';
import { LiveStreamAuditor } from '@/live/stream/live-stream.auditor.js';
import { LiveStreamDetector } from '@/live/stream/live-stream.detector.js';
import { LiveStreamMapper } from '@/live/stream/live-stream.mapper.js';
import { LiveStreamService } from '@/live/stream/live-stream.service.js';

@Module({
  imports: [PlatformModule, ChannelServiceModule, ChannelStorageModule, LiveStorageModule],
  providers: [LiveStreamMapper, LiveStreamService, LiveStreamDetector, LiveStreamAuditor],
  exports: [LiveStreamService, LiveStreamDetector, LiveStreamAuditor],
})
export class LiveStreamModule {}
