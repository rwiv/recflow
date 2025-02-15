import { Controller, Get, UseFilters } from '@nestjs/common';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { TaskScheduler } from '../schedule/task.scheduler.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/tasks')
export class TaskController {
  constructor(private readonly taskScheduler: TaskScheduler) {}

  @Get('/')
  states() {
    return this.taskScheduler.allPeriodTaskStats();
  }
}
