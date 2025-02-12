import { Module } from '@nestjs/common';
import { TaskController } from './task.controller.js';
import { TaskAppModule } from '../app/task.app.module.js';

@Module({
  imports: [TaskAppModule],
  controllers: [TaskController],
})
export class TaskWebModule {}
