import { Module } from '@nestjs/common';
import { ChannelBusinessModule } from '../business/business.module.js';
import { ChannelController } from './channel.controller.js';
import {TagController} from "./tag.controller.js";

@Module({
  imports: [ChannelBusinessModule],
  controllers: [ChannelController, TagController],
})
export class ChannelWebModule {}
