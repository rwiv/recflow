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

  getPeriodTask(taskName: string) {
    return this.periodTaskMap.get(taskName);
  }

  addPeriodTask(task: Task, delayMs: number) {
    if (this.periodTaskMap.has(task.getName())) {
      throw new ConflictError(`task already exists: taskName=${task.getName()}`);
    }
    const periodTask = new PeriodTask(task, delayMs, this.eh);
    this.periodTaskMap.set(task.getName(), periodTask);
  }

  cancelPeriodTask(taskName: string) {
    const periodTask = this.periodTaskMap.get(taskName);
    if (!periodTask) throw NotFoundError.from('PeriodTask', 'name', taskName);
    periodTask.cancel();
    this.periodTaskMap.delete(taskName);
  }

  runPeriodTasks() {
    for (const periodTask of this.periodTaskMap.values()) {
      periodTask.start();
    }
  }

  clear() {
    for (const taskName of this.periodTaskMap.keys()) {
      this.cancelPeriodTask(taskName);
    }
  }
}
