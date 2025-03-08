import { AmqpHttp } from './amqp.interface.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AmqpHttpMock implements AmqpHttp {
  async fetchByPattern(pattern: string) {
    return [];
  }

  async fetchAllQueues() {
    return [];
  }
}
