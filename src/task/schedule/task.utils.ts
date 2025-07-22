import { Worker } from 'bullmq';
import { Task } from '../spec/task.interface.js';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { TaskRunner } from './task.runner.js';

export function createWorker(task: Task, opts: WorkerOptions, runner: TaskRunner) {
  return new Worker(
    task.name,
    (job) => {
      return runner.run(task, job);
    },
    opts,
  );
}
