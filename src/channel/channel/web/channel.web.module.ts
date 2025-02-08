import { Module } from '@nestjs/common';
import { ChannelBusinessModule } from '../business/channel.business.module.js';
import { ChannelController } from './channel.controller.js';

@Module({
  imports: [ChannelBusinessModule],
  controllers: [ChannelController],
})
export class ChannelWebModule {}
