import { z } from 'zod';
import { AmqpConfig } from '../../common/config/config.types.js';
import { queueState } from './amqp.schema.js';
import { AmqpHttp } from './amqp.interface.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { log } from 'jslog';

const queueStates = z.array(queueState);

@Injectable()
export class AmqpHttpImpl implements AmqpHttp {
  private readonly conf: AmqpConfig;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.conf = this.env.amqp;
  }

  async fetchByPattern(pattern: string) {
    const queues = await this.fetchAllQueues();
    const regex = new RegExp(`^${pattern.replace('.', '\\.')}`);
    return queues.filter((queue) => regex.test(queue.name));
  }

  async fetchAllQueues() {
    const url = `http://${this.conf.host}:${this.conf.httpPort}/api/queues`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.conf.username}:${this.conf.password}`).toString('base64')}`,
      },
    });
    if (res.status >= 400) {
      log.error(await res.text());
      throw new HttpRequestError('Failed to fetch queues', res.status);
    }
    return queueStates.parse(await res.json());
  }
}
