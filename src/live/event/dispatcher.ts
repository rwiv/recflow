import { Inject, Injectable } from '@nestjs/common';
import { AMQP } from '../../infra/infra.module.js';
import { Amqp } from '../../infra/amqp/interface.js';
import { ExitCmd, ExitMessage } from './event.schema.js';
import { AMQP_EXIT_QUEUE_PREFIX } from '../../common/data/constants.js';
import { PlatformType } from '../../platform/storage/platform.business.schema.js';

@Injectable()
export class Dispatcher {
  constructor(@Inject(AMQP) private readonly amqp: Amqp) {}

  async exit(cmd: ExitCmd, platform: PlatformType, pid: string) {
    const queue = `${AMQP_EXIT_QUEUE_PREFIX}.${platform}.${pid}`;
    if (!(await this.amqp.checkQueue(queue))) {
      throw new Error(`Not found queue: ${queue}`);
    }
    const message: ExitMessage = { cmd, platform, uid: pid };
    this.amqp.publish(queue, message);
  }
}
