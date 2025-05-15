import { Injectable } from '@nestjs/common';
import { Task } from '../spec/task.interface.js';
import { PeriodTask, PeriodTaskStatus } from './period-task.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

export interface TaskStatus {
  name: string;
  delayMs: number;
  status: PeriodTaskStatus;
  promise: string;
  executionCnt: number;
}

@Injectable()
export class TaskScheduler {
  private periodTaskMap: Map<string, PeriodTask> = new Map();

  constructor(private readonly eh: TaskErrorHandler) {}

  allPeriodTaskStats() {
    return Array.from(this.periodTaskMap.values()).map((t) => this.toTaskStatus(t));
  }

  getPeriodTaskStatus(taskName: string) {
    const periodTask = this.periodTaskMap.get(taskName);
    if (!periodTask) return null;
    return this.toTaskStatus(periodTask);
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

  private toTaskStatus(t: PeriodTask): TaskStatus {
    return {
      name: t.taskName,
      delayMs: t.delayMs,
      status: t.getStatus(),
      promise: t.getPromiseState(),
      executionCnt: t.executionCnt,
    };
  }
}
