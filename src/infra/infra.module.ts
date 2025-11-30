import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { InfraFactory } from '@/infra/infra.factory.js';
import { SERVER_REDIS, TASK_REDIS } from '@/infra/infra.tokens.js';

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
  ],
  exports: [SERVER_REDIS, TASK_REDIS],
})
export class InfraModule {}
