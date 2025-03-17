import { Module } from '@nestjs/common';
import { ChannelServiceModule } from '../service/channel.service.module.js';
import { ChannelController } from './channel.controller.js';
import { TagController } from './tag.controller.js';
import { PriorityController } from './priority.controller.js';
import { ConfigModule } from '../../common/config/config.module.js';

@Module({
  imports: [ConfigModule, ChannelServiceModule],
  controllers: [ChannelController, TagController, PriorityController],
})
export class ChannelWebModule {}
