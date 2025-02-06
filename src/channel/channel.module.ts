import { Module } from '@nestjs/common';
import { ChannelBusinessModule } from './business/business.module.js';
import { ChannelWebModule } from './web/web.module.js';
import { ChannelPriorityModule } from './priority/priority.module.js';

@Module({
  imports: [ChannelBusinessModule, ChannelWebModule, ChannelPriorityModule],
})
export class ChannelModule {}
