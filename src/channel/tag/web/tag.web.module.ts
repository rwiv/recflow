import { Module } from '@nestjs/common';
import { TagController } from './tag.controller.js';
import { ChannelTagBusinessModule } from '../business/tag.business.module.js';

@Module({
  imports: [ChannelTagBusinessModule],
  providers: [TagController],
})
export class ChannelTagWebModule {}
