import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { InfraFactory } from './infra.factory.js';
import { UntfNotifier } from './notify/notifier.untf.js';
import { FakeNotifier } from './notify/notifier.fake.js';
import { StdlFake } from './stdl/stdl.client.fake.js';
import { StdlImpl } from './stdl/stdl.client.impl.js';
import { NOTIFIER, SERVER_REDIS, STDL, STDL_REDIS, TASK_REDIS } from './infra.tokens.js';
import { SQSClientFake } from './sqs/sqs.client.fake.js';
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
      useClass: process.env.NODE_ENV === 'dev' ? StdlFake : StdlImpl,
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
      useClass: process.env.NODE_ENV === 'dev' ? FakeNotifier : UntfNotifier,
    },
    {
      provide: SQSClient,
      useClass: process.env.NODE_ENV === 'dev' ? SQSClientFake : SQSClientImpl,
    },
  ],
  exports: [SERVER_REDIS, TASK_REDIS, STDL, STDL_REDIS, NOTIFIER, SQSClient],
})
export class InfraModule {}
