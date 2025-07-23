import { Module } from '@nestjs/common';
import { LiveStreamService } from './live-stream.service.js';
import { LiveStreamMapper } from './live-stream.mapper.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { LiveStorageModule } from '../storage/live.storage.module.js';

@Module({
  imports: [ChannelServiceModule, LiveStorageModule],
  providers: [LiveStreamMapper, LiveStreamService],
  exports: [LiveStreamService],
})
export class LiveStreamModule {}
