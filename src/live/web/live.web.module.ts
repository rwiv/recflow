import { Module } from '@nestjs/common';
import { LiveAccessModule } from '../access/live.access.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';
import { LiveSchedulerModule } from '../scheduler/scheduler.module.js';

@Module({
  imports: [LiveAccessModule, PlatformModule, LiveSchedulerModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
