import { Injectable } from '@nestjs/common';
import { log } from 'jslog';

import { SQSClient } from '@/external/sqs/sqs.client.js';

@Injectable()
export class SQSClientFake extends SQSClient {
  send(msg: string): Promise<void> {
    log.debug(`SQSClientMock.senc(${msg})`);
    return Promise.resolve();
  }
}
