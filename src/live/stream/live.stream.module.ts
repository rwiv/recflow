import { Module } from '@nestjs/common';
import { LiveStreamService } from './live-stream.service.js';
import { LiveStreamMapper } from './live-stream.mapper.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { LiveStorageModule } from '../storage/live.storage.module.js';
import { LiveStreamDetector } from './live-stream.detector.js';
import { ChannelStorageModule } from '../../channel/storage/channel.storage.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveStreamAuditor } from './live-stream.auditor.js';

@Module({
  imports: [PlatformModule, ChannelServiceModule, ChannelStorageModule, LiveStorageModule],
  providers: [LiveStreamMapper, LiveStreamService, LiveStreamDetector, LiveStreamAuditor],
  exports: [LiveStreamService, LiveStreamDetector, LiveStreamAuditor],
})
export class LiveStreamModule {}
