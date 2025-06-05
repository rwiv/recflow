import { z } from 'zod';
import { AmqpConfig } from '../../common/config/config.types.js';
import { queueState } from './amqp.schema.js';
import { AmqpHttp } from './amqp.interface.js';
import { Env } from '../../common/config/env.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { log } from 'jslog';
import { stacktrace } from '../../utils/errors/utils.js';
import { FatalError } from '../../utils/errors/errors/FatalError.js';

const queueStates = z.array(queueState);
export type QueueState = z.infer<typeof queueState>;

const MAX_RETRY_CNT = 3;
const BASE_RETRY_DELAY = 100;

export class AmqpHttpImpl implements AmqpHttp {
  constructor(
    private readonly conf: AmqpConfig,
    private readonly env: Env,
  ) {}

  async fetchByPattern(pattern: string) {
    const queues = await this.fetchAllQueues();
    const regex = new RegExp(`^${pattern.replace('.', '\\.')}`);
    return queues.filter((queue) => regex.test(queue.name));
  }

  async fetchAllQueues(): Promise<QueueState[]> {
    for (let retryCnt = 0; retryCnt <= MAX_RETRY_CNT; retryCnt++) {
      try {
        return await this._fetchAllQueues();
      } catch (e) {
        if (retryCnt === MAX_RETRY_CNT) {
          throw e;
        }
        await new Promise((resolve) => setTimeout(resolve, BASE_RETRY_DELAY * 2 ** retryCnt));
      }
    }
    throw new FatalError('Unreachable');
  }

  async _fetchAllQueues(): Promise<QueueState[]> {
    const url = `http://${this.conf.host}:${this.conf.httpPort}/api/queues`;
    const token = Buffer.from(`${this.conf.username}:${this.conf.password}`).toString('base64');
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${token}` },
      signal: AbortSignal.timeout(this.env.httpTimeout),
    });
    if (res.status >= 400) {
      throw new HttpRequestError(await res.text(), res.status);
    }

    const text = await res.text();
    try {
      return queueStates.parse(JSON.parse(text));
    } catch (e) {
      log.error('Failed to parse', { source: text, stack: stacktrace(e) });
      throw e;
    }
  }

  async existsQueue(queue: string) {
    const queues = await this.fetchAllQueues();
    return !!queues.find((q) => q.name === queue);
  }
}
