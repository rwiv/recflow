import { Worker } from 'bullmq';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { JobsOptions } from 'bullmq/dist/esm/types/index.js';

import { Env } from '@/common/config/env.js';

import { TaskRunner } from '@/task/schedule/task.runner.js';
import { Task } from '@/task/spec/task.interface.js';

export function createWorker(task: Task, opts: WorkerOptions, runner: TaskRunner) {
  return new Worker(
    task.name,
    (job) => {
      return runner.run(task, job);
    },
    opts,
  );
}

export function getJobOpts(env: Env): JobsOptions {
  if (env.nodeEnv === 'prod') {
    return { removeOnComplete: 100, removeOnFail: 10 };
  } else {
    return { removeOnComplete: 10, removeOnFail: 3 };
  }
}
