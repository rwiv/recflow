import { Inject, Injectable } from '@nestjs/common';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { CHANNEL_CACHE_CHECK_NAME, CHANNEL_REFRESH_NAME } from './channel.tasks.constants.js';
import { ChannelCacheChecker } from '../../channel/service/channel.cache.checker.js';
import { Task } from '../spec/task.interface.js';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { TaskRunner } from '../schedule/task.runner.js';
import { createWorker } from '../schedule/task.utils.js';

@Injectable()
export class ChannelTaskInitializer {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly runner: TaskRunner,
    private readonly chWriter: ChannelWriter,
    private readonly checker: ChannelCacheChecker,
  ) {}

  init() {
    const cronOpts: WorkerOptions = { connection: this.redis, concurrency: 1 };

    const refreshTask: Task = {
      name: CHANNEL_REFRESH_NAME,
      run: () => this.chWriter.refresh(),
    };
    createWorker(refreshTask, cronOpts, this.runner);

    const cacheCheckTask: Task = {
      name: CHANNEL_CACHE_CHECK_NAME,
      run: () => this.checker.checkCache(),
    };
    createWorker(cacheCheckTask, cronOpts, this.runner);
  }
}
