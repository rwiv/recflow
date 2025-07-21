import { Worker } from 'bullmq';
import { taskMeta } from '../spec/task.schema.js';
import { Task } from '../spec/task.interface.js';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { TaskRunner } from './task.runner.js';

export function createWorker(task: Task, opts: WorkerOptions, runner: TaskRunner) {
  return new Worker(
    task.name,
    (job) => {
      const meta = taskMeta.parse({
        lock: job.data?.meta?.lock,
        delay: task.delay,
      });
      return runner.run(task, meta, job.data?.args);
    },
    opts,
  );
}
