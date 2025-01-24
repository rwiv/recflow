import { log } from 'jslog';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';

export abstract class Notifier {
  abstract notify(topic: string, message: string): Promise<void>;

  async sendLiveInfo(topic: string, channelName: string, userCnt: number, title: string) {
    const msg = { channelName, userCnt, title };
    log.info('New Live', msg);
    const notifyMsg = `${msg.channelName} (${msg.userCnt}): ${msg.title}`;
    await this.notify(topic, notifyMsg);
  }
}

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

@Injectable()
export class MockNotifier extends Notifier {
  notify(topic: string, message: string): Promise<void> {
    log.info(`MockNotifier.notify(${topic}, ${message})`);
    return Promise.resolve();
  }
}
