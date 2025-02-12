import { Module } from '@nestjs/common';
import { TaskController } from './task.controller.js';
import { TaskServiceModule } from '../service/task.service.module.js';

@Module({
  imports: [TaskServiceModule],
  controllers: [TaskController],
})
export class TaskWebModule {}
