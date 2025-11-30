import { Inject, Injectable } from '@nestjs/common';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { Redis } from 'ioredis';

import { TASK_REDIS } from '@/infra/infra.tokens.js';

import { CHANNEL_CACHE_CHECK_NAME, CHANNEL_REFRESH_NAME } from '@/task/channel/channel.tasks.constants.js';
import { TaskRunner } from '@/task/schedule/task.runner.js';
import { createWorker } from '@/task/schedule/task.utils.js';
import { Task } from '@/task/spec/task.interface.js';

import { ChannelCacheChecker } from '@/channel/service/channel.cache.checker.js';
import { ChannelWriter } from '@/channel/service/channel.writer.js';

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
      run: () => this.chWriter.refreshEarliestOne(),
    };
    createWorker(refreshTask, cronOpts, this.runner);

    const cacheCheckTask: Task = {
      name: CHANNEL_CACHE_CHECK_NAME,
      run: () => this.checker.checkCache(),
    };
    createWorker(cacheCheckTask, cronOpts, this.runner);
  }
}
