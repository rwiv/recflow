import { Module } from '@nestjs/common';
import { ChannelBusinessModule } from './channel/business/channel.business.module.js';
import { ChannelWebModule } from './channel/web/channel.web.module.js';
import { ChannelPriorityModule } from './priority/priority.module.js';
import { ChannelTagModule } from './tag/tag.module.js';

@Module({
  imports: [ChannelBusinessModule, ChannelWebModule, ChannelPriorityModule, ChannelTagModule],
})
export class ChannelModule {}
