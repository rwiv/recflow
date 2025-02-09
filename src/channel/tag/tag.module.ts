import { Module } from '@nestjs/common';
import { ChannelTagWebModule } from './web/tag.web.module.js';

@Module({
  imports: [ChannelTagWebModule],
})
export class ChannelTagModule {}
