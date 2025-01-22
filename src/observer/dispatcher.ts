import { Inject, Injectable } from '@nestjs/common';
import { Amqp } from '../client/amqp.js';
import { AMQP } from '../client/client.module.js';
import { PlatformType } from '../platform/common.js';

export const EXIT_QUEUE = 'stdl:exit';

export type ExitCmd = 'delete' | 'cancel' | 'finish';

export interface ExitMessage {
  cmd: ExitCmd;
  platform: PlatformType;
  uid: string;
}

@Injectable()
export class Dispatcher {
  constructor(@Inject(AMQP) private readonly amqp: Amqp) {}

  async cancel(platform: PlatformType, uid: string) {
    await this.send('cancel', platform, uid);
  }

  async finish(platform: PlatformType, uid: string) {
    await this.send('finish', platform, uid);
  }

  async send(cmd: ExitCmd, platform: PlatformType, uid: string) {
    await this.amqp.assertQueue(EXIT_QUEUE);
    const message: ExitMessage = { cmd: cmd, platform, uid };
    this.amqp.publish(EXIT_QUEUE, message);
  }
}
