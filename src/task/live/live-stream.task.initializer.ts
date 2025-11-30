import { Inject, Injectable } from '@nestjs/common';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { Redis } from 'ioredis';

import { TASK_REDIS } from '@/infra/infra.tokens.js';

import { LIVE_STREAM_AUDIT_NAME, LIVE_STREAM_DETECTION_NAME } from '@/task/live/live.task.contants.js';
import { TaskRunner } from '@/task/schedule/task.runner.js';
import { createWorker } from '@/task/schedule/task.utils.js';
import { Task } from '@/task/spec/task.interface.js';

import { LiveStreamAuditor } from '@/live/stream/live-stream.auditor.js';
import { LiveStreamDetector } from '@/live/stream/live-stream.detector.js';

@Injectable()
export class LiveStreamTaskInitializer {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly runner: TaskRunner,
    private readonly streamDetector: LiveStreamDetector,
    private readonly streamAuditor: LiveStreamAuditor,
  ) {}

  init() {
    const cronOpts: WorkerOptions = { connection: this.redis, concurrency: 1 };

    const detectionTask: Task = {
      name: LIVE_STREAM_DETECTION_NAME,
      run: () => this.streamDetector.check('soop'),
    };
    createWorker(detectionTask, cronOpts, this.runner);

    const auditTask: Task = {
      name: LIVE_STREAM_AUDIT_NAME,
      run: () => this.streamAuditor.check(),
    };
    createWorker(auditTask, cronOpts, this.runner);
  }
}
