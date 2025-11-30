import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { SQSClientFake } from '@/external/sqs/sqs.client.fake.js';
import { SQSClientImpl } from '@/external/sqs/sqs.client.impl.js';
import { SQSClient } from '@/external/sqs/sqs.client.js';

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
