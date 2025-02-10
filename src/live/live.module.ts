import { Module } from '@nestjs/common';
import { LiveSchedulerModule } from './scheduler/scheduler.module.js';
import { LiveWebModule } from './web/live.web.module.js';

@Module({
  imports: [LiveSchedulerModule, LiveWebModule],
})
export class LiveModule {}
