import { Injectable } from '@nestjs/common';
import { Task } from '../spec/task.interface.js';
import { PeriodTask } from './period-task.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class TaskScheduler {
  private periodTasks: PeriodTask[] = [];
  private periodTaskMap: Map<string, PeriodTask> = new Map();

  constructor(private readonly eh: TaskErrorHandler) {}

  addPeriodTask(task: Task, delayMs: number) {
    if (this.periodTaskMap.has(task.getName())) {
      throw new ConflictError('task already exists');
    }
    const periodTask = new PeriodTask(task, delayMs, this.eh);
    this.periodTaskMap.set(task.getName(), periodTask);
  }

  stopPeriodTask(taskName: string) {
    const periodTask = this.periodTaskMap.get(taskName);
    if (!periodTask) throw NotFoundError.from('PeriodTask', 'name', taskName);
    periodTask.cancel();
    this.periodTaskMap.delete(taskName);
  }

  get() {
    return this.periodTasks;
  }

  runPeriodTasks() {
    this.periodTasks.forEach((task) => task.start());
  }

  cancel() {
    this.periodTasks.forEach((task) => task.cancel());
  }
}
