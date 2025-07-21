import { Inject, Injectable } from '@nestjs/common';
import { NodeWriter } from '../../node/service/node.writer.js';
import { Task } from '../spec/task.interface.js';
import { nodeTaskName } from './node.tasks.constants.js';
import { TaskRunner } from '../schedule/task.runner.js';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { createWorker } from '../schedule/task.utils.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';

@Injectable()
export class NodeTaskInitializer {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly runner: TaskRunner,
    private readonly nodeWriter: NodeWriter,
  ) {}

  init() {
    const cronOpts: WorkerOptions = { connection: this.redis, concurrency: 1 };

    const resetTask: Task = {
      name: nodeTaskName.NODE_RESET,
      delay: this.env.nodeResetCycleSec * 1000,
      run: () => this.nodeWriter.resetFailureCntAll(),
    };
    createWorker(resetTask, cronOpts, this.runner);
    // this.scheduler.addPeriodTask(resetTask, this.env.nodeResetCycleSec * 1000, true);
  }
}
