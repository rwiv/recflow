import { Module } from '@nestjs/common';
import { ChannelPriorityModule } from './priority/priority.module.js';
import { ChannelTagModule } from './tag/tag.module.js';
import { ChannelRecordModule } from './channel/channel.module.js';

@Module({
  imports: [ChannelRecordModule, ChannelTagModule, ChannelPriorityModule],
})
export class ChannelModule {}
