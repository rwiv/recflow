import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Notifier } from './notifier.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { errorResponse } from '../../common/data/common.schema.js';

interface UntfSendRequest {
  topic: string;
  message: string;
}

@Injectable()
export class UntfNotifier extends Notifier {
  private readonly endpoint: string;
  private readonly authKey: string;

  constructor(@Inject(ENV) private readonly env: Env) {
    super();
    this.endpoint = this.env.untf.endpoint;
    this.authKey = this.env.untf.authKey;
  }

  async notify(topic: string, message: string): Promise<void> {
    const url = `${this.endpoint}/api/send/v1`;
    const body: UntfSendRequest = { topic, message };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authKey}`,
      },
      body: JSON.stringify(body),
    });
    if (res.status >= 400) {
      const errRes = errorResponse.parse(await res.json());
      throw new HttpRequestError(errRes.message, res.status);
    }
  }
}
