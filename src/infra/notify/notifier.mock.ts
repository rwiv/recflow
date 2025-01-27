import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { Notifier } from './notifier.js';

@Injectable()
export class MockNotifier extends Notifier {
  notify(topic: string, message: string): Promise<void> {
    log.info(`MockNotifier.notify(${topic}, ${message})`);
    return Promise.resolve();
  }
}
