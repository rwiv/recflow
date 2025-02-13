import { Module } from '@nestjs/common';
import { TaskSchedulerModule } from './schedule/task.schedule.module.js';
import { LiveTaskModule } from './live/live.task.module.js';

@Module({
  imports: [TaskSchedulerModule, LiveTaskModule],
})
export class TaskModule {}
