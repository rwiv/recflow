import { SQSClient } from './sqs.client.js';
import { log } from 'jslog';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SQSClientFake extends SQSClient {
  send(msg: string): Promise<void> {
    log.debug(`SQSClientMock.senc(${msg})`);
    return Promise.resolve();
  }
}
