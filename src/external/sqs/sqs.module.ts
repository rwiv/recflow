import { Module } from '@nestjs/common';
import { SQSClient } from './sqs.client.js';
import { SQSClientFake } from './sqs.client.fake.js';
import { SQSClientImpl } from './sqs.client.impl.js';
import { ConfigModule } from '../../common/config/config.module.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SQSClient,
      useClass: process.env.NODE_ENV === 'dev' ? SQSClientFake : SQSClientImpl,
    },
  ],
  exports: [SQSClient],
})
export class SQSModule {}
