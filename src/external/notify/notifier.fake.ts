import { Injectable } from '@nestjs/common';
import { log } from 'jslog';

import { Notifier } from '@/external/notify/notifier.js';

@Injectable()
export class FakeNotifier extends Notifier {
  notify(message: string): void {
    log.info(`MockNotifier.notify(${message})`);
  }
}
