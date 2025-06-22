import { SQSClient } from './sqs.client.js';
import { log } from 'jslog';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SQSClientMock implements SQSClient {
  async send(msg: string): Promise<void> {
    log.debug(`SQSClientMock.senc(${msg})`);
  }
}
