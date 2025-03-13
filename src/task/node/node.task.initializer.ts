import { Inject, Injectable } from '@nestjs/common';
import { NodeResetTask } from './node.reset.task.js';
import { TaskScheduler } from '../schedule/task.scheduler.js';
import { NodeWriter } from '../../node/service/node.writer.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';

@Injectable()
export class NodeTaskInitializer {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly scheduler: TaskScheduler,
    private readonly nodeWriter: NodeWriter,
  ) {}

  init() {
    const task = new NodeResetTask(this.nodeWriter);
    this.scheduler.addPeriodTask(task, this.env.nodeResetCycleSec * 1000, true);
  }
}
