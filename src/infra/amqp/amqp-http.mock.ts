import { AmqpHttp } from './amqp.interface.js';
import { Injectable } from '@nestjs/common';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { AMQP_EXIT_QUEUE_PREFIX } from '../../common/data/constants.js';

const FILTER_NODE_GROUP_NAME = 'main';

@Injectable()
export class AmqpHttpMock implements AmqpHttp {
  async fetchByPattern(pattern: string) {
    const lives = await this.fetchLives();
    const filtered = lives.filter((live) => {
      return live.node?.group?.name !== FILTER_NODE_GROUP_NAME;
    });
    return filtered.map((live) => {
      const queueName = `${AMQP_EXIT_QUEUE_PREFIX}.${live.platform.name}.${live.channel.pid}`;
      return { name: queueName, state: 'active' };
    });
  }

  async existsQueue(queue: string) {
    for (const live of await this.fetchLives()) {
      const queueName = `${AMQP_EXIT_QUEUE_PREFIX}.${live.platform.name}.${live.channel.pid}`;
      if (queueName === queue) {
        return true;
      }
    }
    return false;
  }

  private async fetchLives() {
    return (await (await fetch('http://localhost:3000/api/lives')).json()) as LiveDto[];
  }
}
