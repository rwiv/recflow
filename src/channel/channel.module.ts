import { Module } from '@nestjs/common';
import { ChannelTagModule } from './tag/tag.module.js';
import { ChannelRecordModule } from './channel/channel.module.js';

@Module({
  imports: [ChannelRecordModule, ChannelTagModule],
})
export class ChannelModule {}
