import { AmqpHttp } from './amqp.interface.js';
import { Injectable } from '@nestjs/common';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { AMQP_EXIT_QUEUE_PREFIX } from '../../common/data/constants.js';

const FILTER_NODE_GROUP_NAME = 'main';

@Injectable()
export class AmqpHttpMock implements AmqpHttp {
  async fetchByPattern(pattern: string) {
    const lives = (await (await fetch('http://localhost:3000/api/lives')).json()) as LiveDto[];
    const filtered = lives.filter((live) => {
      return live.node?.group?.name !== FILTER_NODE_GROUP_NAME;
    });
    return filtered.map((live) => {
      const queueName = `${AMQP_EXIT_QUEUE_PREFIX}.${live.platform.name}.${live.channel.pid}`;
      return { name: queueName, state: 'active' };
    });
  }
}
