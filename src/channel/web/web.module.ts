import { Module } from '@nestjs/common';
import { ChannelBusinessModule } from '../business/business.module.js';
import { ChannelController } from './channel.controller.js';

@Module({
  imports: [ChannelBusinessModule],
  controllers: [ChannelController],
})
export class ChannelWebModule {}
