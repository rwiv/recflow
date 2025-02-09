import { Module } from '@nestjs/common';
import { ChannelWebModule } from './web/channel.web.module.js';

@Module({
  imports: [ChannelWebModule],
})
export class ChannelRecordModule {}
