import { Module } from '@nestjs/common';
import { TaskWebModule } from './web/task.web.module.js';

@Module({
  imports: [TaskWebModule],
})
export class TaskModule {}
