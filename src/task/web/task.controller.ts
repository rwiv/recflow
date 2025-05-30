import { Controller, Get, Post, UseFilters } from '@nestjs/common';
import { HttpErrorFilter } from '../../common/error/error.filter.js';
import { TaskScheduler } from '../schedule/task.scheduler.js';
import { LiveAllocationTask } from '../live/tasks/live.allocation-task.js';
import { DEFAULT_LIVE_ALLOCATION_CYCLE } from '../live/spec/live.task.contants.js';
import { LiveAllocator } from '../../live/registry/live.allocator.js';
import { liveTaskName } from '../live/spec/live.task.names.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/tasks')
export class TaskController {
  constructor(
    private readonly scheduler: TaskScheduler,
    private readonly liveAllocator: LiveAllocator,
  ) {}

  @Get('/')
  states() {
    return this.scheduler.allPeriodTaskStats();
  }

  @Post('/lives/allocation/start')
  startAllocationTask() {
    const liveAllocationTask = new LiveAllocationTask(this.liveAllocator);
    this.scheduler.addPeriodTask(liveAllocationTask, DEFAULT_LIVE_ALLOCATION_CYCLE, true);
  }

  @Post('/lives/allocation/stop')
  stopAllocationTask() {
    this.scheduler.cancelPeriodTask(liveTaskName.LIVE_ALLOCATION);
  }
}
