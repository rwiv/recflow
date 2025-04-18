import { Inject, Injectable } from '@nestjs/common';
import { StdlDoneMessage, Vtask } from './types.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';

@Injectable()
export class VtaskImpl implements Vtask {
  private readonly endpoint: string;
  constructor(@Inject(ENV) private readonly env: Env) {
    this.endpoint = this.env.vtask.endpoint;
  }

  async addTask(doneMessage: StdlDoneMessage): Promise<void> {
    const body = JSON.stringify(doneMessage);
    await fetch(`${this.endpoint}/api/stdl/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
  }
}
