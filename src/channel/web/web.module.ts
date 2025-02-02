import { Module } from '@nestjs/common';
import { ChannelBusinessModule } from '../business/business.module.js';
import { ChannelController } from './channel.controller.js';
import { PlatformModule } from '../../platform/platform.module.js';

@Module({
  imports: [ChannelBusinessModule, PlatformModule],
  controllers: [ChannelController],
})
export class ChannelWebModule {}
