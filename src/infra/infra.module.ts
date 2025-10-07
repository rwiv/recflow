import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { InfraFactory } from './infra.factory.js';
import { UntfNotifier } from './notify/notifier.untf.js';
import { MockNotifier } from './notify/notifier.mock.js';
import { StdlMock } from './stdl/stdl.client.mock.js';
import { StdlImpl } from './stdl/stdl.client.impl.js';
import { NOTIFIER, SERVER_REDIS, STDL, STDL_REDIS, TASK_REDIS } from './infra.tokens.js';
import { SQSClientMock } from './sqs/sqs.client.mock.js';
import { SQSClientImpl } from './sqs/sqs.client.impl.js';
import { SQSClient } from './sqs/sqs.client.js';

@Module({
  imports: [ConfigModule],
  providers: [
    InfraFactory,
    {
      provide: SERVER_REDIS,
      useFactory: (factory: InfraFactory) => {
        return factory.createServerRedis();
      },
      inject: [InfraFactory],
    },
    {
      provide: TASK_REDIS,
      useFactory: (factory: InfraFactory) => {
        return factory.createTaskRedis();
      },
      inject: [InfraFactory],
    },
    {
      provide: STDL,
      useClass: process.env.NODE_ENV === 'dev' ? StdlMock : StdlImpl,
    },
    {
      provide: STDL_REDIS,
      useFactory: (factory: InfraFactory) => {
        return factory.createStdlRedis();
      },
      inject: [InfraFactory],
    },
    {
      provide: NOTIFIER,
      useClass: process.env.NODE_ENV === 'dev' ? MockNotifier : UntfNotifier,
    },
    {
      provide: SQSClient,
      useClass: process.env.NODE_ENV === 'dev' ? SQSClientMock : SQSClientImpl,
    },
  ],
  exports: [SERVER_REDIS, TASK_REDIS, STDL, STDL_REDIS, NOTIFIER, SQSClient],
})
export class InfraModule {}
