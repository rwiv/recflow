import { AmqpHttp } from './amqp.interface.js';
import { LiveDto } from '../../live/spec/live.dto.schema.js';

export class AmqpHttpMock implements AmqpHttp {
  async fetchByPattern(pattern: string) {
    return [];
  }

  async existsQueue(queue: string) {
    return false;
  }

  private async fetchLives() {
    const res = await fetch('http://localhost:3000/api/lives');
    return (await res.json()) as LiveDto[];
  }
}
