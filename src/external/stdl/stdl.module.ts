import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { StdlFactory } from './stdl.factory.js';
import { Stdl } from './client/stdl.client.js';
import { StdlImpl } from './client/stdl.client.impl.js';
import { StdlFake } from './client/stdl.client.fake.js';
import { StdlRedis } from './redis/stdl.redis.js';

@Module({
  imports: [ConfigModule],
  providers: [
    StdlFactory,
    {
      provide: Stdl,
      useClass: process.env.NODE_ENV === 'dev' ? StdlFake : StdlImpl,
    },
    {
      provide: StdlRedis,
      useFactory: (factory: StdlFactory) => {
        return factory.createStdlRedis();
      },
      inject: [StdlFactory],
    },
  ],
  exports: [Stdl, StdlRedis],
})
export class StdlModule {}
