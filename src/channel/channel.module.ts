import { Module } from '@nestjs/common';
import { ChannelBusinessModule } from './business/business.module.js';
import { ChannelWebModule } from './web/web.module.js';

@Module({
  imports: [ChannelBusinessModule, ChannelWebModule],
})
export class ChannelModule {}
