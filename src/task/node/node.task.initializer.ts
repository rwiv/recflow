import { Inject, Injectable } from '@nestjs/common';
import { NodeWriter } from '../../node/service/node.writer.js';
import { Task } from '../spec/task.interface.js';
import { NODE_RESET_NAME } from './node.tasks.constants.js';
import { TaskRunner } from '../schedule/task.runner.js';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { createWorker } from '../schedule/task.utils.js';

@Injectable()
export class NodeTaskInitializer {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly runner: TaskRunner,
    private readonly nodeWriter: NodeWriter,
  ) {}

  init() {
    const cronOpts: WorkerOptions = { connection: this.redis, concurrency: 1 };

    const resetTask: Task = {
      name: NODE_RESET_NAME,
      run: () => this.nodeWriter.resetFailureCntAll(),
    };
    createWorker(resetTask, cronOpts, this.runner);
  }
}
