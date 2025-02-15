import { Module } from '@nestjs/common';
import { TaskSchedulerModule } from './schedule/task.schedule.module.js';
import { LiveTaskModule } from './live/live.task.module.js';
import { TaskWebModule } from './web/task.web.module.js';

@Module({
  imports: [TaskSchedulerModule, LiveTaskModule, TaskWebModule],
})
export class TaskModule {}
