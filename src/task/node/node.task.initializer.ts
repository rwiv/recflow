import { Inject, Injectable } from '@nestjs/common';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { Redis } from 'ioredis';

import { TASK_REDIS } from '@/infra/infra.tokens.js';

import { NODE_DRAIN_NAME, NODE_LIVES_CHECK_NAME, NODE_RESET_NAME } from '@/task/node/node.tasks.constants.js';
import { TaskRunner } from '@/task/schedule/task.runner.js';
import { createWorker } from '@/task/schedule/task.utils.js';
import { Task } from '@/task/spec/task.interface.js';

import { NodeWriter } from '@/node/service/node.writer.js';

import { LiveDrainer, drainArgs } from '@/live/coord/live.drainer.js';

@Injectable()
export class NodeTaskInitializer {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly runner: TaskRunner,
    private readonly nodeWriter: NodeWriter,
    private readonly liveRebalancer: LiveDrainer,
  ) {}

  init() {
    const cronOpts: WorkerOptions = { connection: this.redis, concurrency: 1 };

    const resetTask: Task = {
      name: NODE_RESET_NAME,
      run: () => this.nodeWriter.resetFailureCntAll(),
    };
    createWorker(resetTask, cronOpts, this.runner);

    const livesCheckTask: Task = {
      name: NODE_LIVES_CHECK_NAME,
      run: () => this.nodeWriter.syncLivesCounts(),
    };
    createWorker(livesCheckTask, cronOpts, this.runner);

    const drainTask: Task = {
      name: NODE_DRAIN_NAME,
      run: (args) => this.liveRebalancer.drain(drainArgs.parse(args)),
    };
    createWorker(drainTask, cronOpts, this.runner);
  }
}
