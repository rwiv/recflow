import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Notifier } from './notifier.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { errorResponse } from '../../common/data/common.schema.js';
import { log } from 'jslog';
import { stacktrace } from '../../utils/errors/utils.js';

interface UntfSendRequest {
  topic: string;
  message: string;
}

@Injectable()
export class UntfNotifier extends Notifier {
  private readonly endpoint: string;
  private readonly apiKey: string;

  constructor(@Inject(ENV) private readonly env: Env) {
    super();
    this.endpoint = this.env.untf.endpoint;
    this.apiKey = this.env.untf.apiKey;
  }

  notify(topic: string, message: string): void {
    this._notify(topic, message).catch((err) => {
      log.error('Notification failure', { stack: stacktrace(err) });
    });
  }

  private async _notify(topic: string, message: string): Promise<void> {
    const url = `${this.endpoint}/api/send/v1`;
    const body: UntfSendRequest = { topic, message };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.env.httpTimeout),
    });
    if (res.status >= 400) {
      const errRes = errorResponse.parse(await res.json());
      throw new HttpRequestError(errRes.message, res.status);
    }
  }
}
