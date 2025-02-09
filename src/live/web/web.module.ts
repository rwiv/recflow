import { Module } from '@nestjs/common';
import { LiveBusinessModule } from '../business/live.business.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';
import { LiveSchedulerModule } from '../scheduler/scheduler.module.js';

@Module({
  imports: [LiveBusinessModule, PlatformModule, LiveSchedulerModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
