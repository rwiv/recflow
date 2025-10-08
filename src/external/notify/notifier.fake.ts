import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { Notifier } from './notifier.js';

@Injectable()
export class FakeNotifier extends Notifier {
  notify(message: string): void {
    log.info(`MockNotifier.notify(${message})`);
  }
}
