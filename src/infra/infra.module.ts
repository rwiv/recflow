import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { InfraFactory } from './infra.factory.js';
import { UntfNotifier } from './notify/notifier.untf.js';
import { FakeNotifier } from './notify/notifier.fake.js';
import { StdlFake } from './stdl/stdl.client.fake.js';
import { StdlImpl } from './stdl/stdl.client.impl.js';
import { SERVER_REDIS, TASK_REDIS } from './infra.tokens.js';
import { SQSClientFake } from './sqs/sqs.client.fake.js';
import { SQSClientImpl } from './sqs/sqs.client.impl.js';
import { SQSClient } from './sqs/sqs.client.js';
import { Notifier } from './notify/notifier.js';
import { Stdl } from './stdl/stdl.client.js';
import { StdlRedis } from './stdl/stdl.redis.js';

@Module({
  imports: [ConfigModule],
  providers: [
    InfraFactory,
    {
      provide: Stdl,
      useClass: process.env.NODE_ENV === 'dev' ? StdlFake : StdlImpl,
    },
    {
      provide: StdlRedis,
      useFactory: (factory: InfraFactory) => {
        return factory.createStdlRedis();
      },
      inject: [InfraFactory],
    },
    {
      provide: Notifier,
      useClass: process.env.NODE_ENV === 'dev' ? FakeNotifier : UntfNotifier,
    },
    {
      provide: SQSClient,
      useClass: process.env.NODE_ENV === 'dev' ? SQSClientFake : SQSClientImpl,
    },
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
  ],
  exports: [SERVER_REDIS, TASK_REDIS, Stdl, StdlRedis, Notifier, SQSClient],
})
export class InfraModule {}
