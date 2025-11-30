import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { ChannelServiceModule } from '@/channel/service/channel.service.module.js';
import { ChannelController } from '@/channel/web/channel.controller.js';
import { GradeController } from '@/channel/web/grade.controller.js';
import { TagController } from '@/channel/web/tag.controller.js';

@Module({
  imports: [ConfigModule, ChannelServiceModule],
  controllers: [ChannelController, TagController, GradeController],
})
export class ChannelWebModule {}
