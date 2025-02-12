import { Module } from '@nestjs/common';
import { TaskScheduleModule } from './schedule/task.schedule.module.js';

@Module({
  imports: [TaskScheduleModule],
})
export class TaskModule {}
