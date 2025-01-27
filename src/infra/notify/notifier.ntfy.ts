import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config.module.js';
import { Env } from '../../common/env.js';
import { Notifier } from './notifier.js';

@Injectable()
export class NtfyNotifier extends Notifier {
  private readonly ntfyEndpoint: string;

  constructor(@Inject(ENV) private readonly env: Env) {
    super();
    this.ntfyEndpoint = this.env.ntfyEndpoint;
  }

  async notify(topic: string, message: string): Promise<void> {
    const url = `${this.ntfyEndpoint}/${topic}`;
    await fetch(url, {
      method: 'POST',
      body: message,
    });
  }
}
