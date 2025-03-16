import { Inject, Injectable } from '@nestjs/common';
import { AMQP, AMQP_HTTP } from '../../infra/infra.tokens.js';
import { Amqp, AmqpHttp } from '../../infra/amqp/amqp.interface.js';
import { ExitCmd, ExitMessage } from './event.schema.js';
import { AMQP_EXIT_QUEUE_PREFIX } from '../../common/data/constants.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class Dispatcher {
  constructor(
    @Inject(AMQP) private readonly amqp: Amqp,
    @Inject(AMQP_HTTP) private readonly amqpHttp: AmqpHttp,
  ) {}

  async sendExitMessage(cmd: ExitCmd, platform: PlatformName, pid: string) {
    const queueName = `${AMQP_EXIT_QUEUE_PREFIX}.${platform}.${pid}`;
    if (!(await this.amqpHttp.existsQueue(queueName))) {
      throw NotFoundError.from('queue', 'name', queueName);
    }
    const message: ExitMessage = { cmd, platform, uid: pid };
    this.amqp.publish(queueName, message);
  }
}
