import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { RecnodeFake } from '@/external/recnode/client/recnode.client.fake.js';
import { RecnodeImpl } from '@/external/recnode/client/recnode.client.impl.js';
import { Recnode } from '@/external/recnode/client/recnode.client.js';
import { RecnodeFactory } from '@/external/recnode/recnode.factory.js';
import { RecnodeRedis } from '@/external/recnode/redis/recnode.redis.js';

@Module({
  imports: [ConfigModule],
  providers: [
    RecnodeFactory,
    {
      provide: Recnode,
      useClass: process.env.NODE_ENV === 'dev' ? RecnodeFake : RecnodeImpl,
    },
    {
      provide: RecnodeRedis,
      useFactory: (factory: RecnodeFactory) => {
        return factory.createRecnodeRedis();
      },
      inject: [RecnodeFactory],
    },
  ],
  exports: [Recnode, RecnodeRedis],
})
export class RecnodeModule {}
