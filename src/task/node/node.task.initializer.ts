import { Inject, Injectable } from '@nestjs/common';
import { TaskScheduler } from '../schedule/task.scheduler.js';
import { NodeWriter } from '../../node/service/node.writer.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Task } from '../spec/task.interface.js';
import { nodeTaskName } from './node.tasks.constants.js';

@Injectable()
export class NodeTaskInitializer {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly scheduler: TaskScheduler,
    private readonly nodeWriter: NodeWriter,
  ) {}

  init() {
    const resetTask: Task = {
      name: nodeTaskName.NODE_RESET,
      run: () => this.nodeWriter.resetFailureCntAll(),
    };
    this.scheduler.addPeriodTask(resetTask, this.env.nodeResetCycleSec * 1000, true);
  }
}
