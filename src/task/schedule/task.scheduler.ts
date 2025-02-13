import { Injectable } from '@nestjs/common';
import { Task } from '../spec/task.interface.js';
import { PeriodTask } from './period-task.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class TaskScheduler {
  private periodTaskMap: Map<string, PeriodTask> = new Map();

  constructor(private readonly eh: TaskErrorHandler) {}

  allPeriodTasks() {
    return Array.from(this.periodTaskMap.values());
  }

  getPeriodTask(taskName: string) {
    return this.periodTaskMap.get(taskName);
  }

  addPeriodTask(task: Task, delayMs: number, withStart: boolean = false) {
    if (this.periodTaskMap.has(task.name)) {
      throw new ConflictError(`task already exists: taskName=${task.name}`);
    }
    const periodTask = new PeriodTask(task, delayMs, this.eh);
    this.periodTaskMap.set(task.name, periodTask);
    if (withStart) {
      periodTask.start();
    }
  }

  cancelPeriodTask(taskName: string) {
    const periodTask = this.periodTaskMap.get(taskName);
    if (!periodTask) throw NotFoundError.from('PeriodTask', 'name', taskName);
    periodTask.cancel();
    this.periodTaskMap.delete(taskName);
  }
}
