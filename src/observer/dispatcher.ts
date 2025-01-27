import { Inject, Injectable } from '@nestjs/common';
import { Amqp } from '../client/amqp.js';
import { AMQP } from '../client/client.module.js';
import { PlatformType } from '../platform/types.js';
import { AMQP_QUEUE_PREFIX } from './consts.js';

export type ExitCmd = 'delete' | 'cancel';

export interface ExitMessage {
  cmd: ExitCmd;
  platform: PlatformType;
  uid: string;
}

@Injectable()
export class Dispatcher {
  constructor(@Inject(AMQP) private readonly amqp: Amqp) {}

  async send(cmd: ExitCmd, platform: PlatformType, uid: string) {
    const queue = `${AMQP_QUEUE_PREFIX}:${platform}:${uid}`;
    if (!(await this.amqp.checkQueue(queue))) {
      throw new Error(`Not found queue: ${queue}`);
    }
    const message: ExitMessage = { cmd, platform, uid };
    this.amqp.publish(queue, message);
  }
}
