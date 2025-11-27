import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { RecnodeFactory } from './recnode.factory.js';
import { Recnode } from './client/recnode.client.js';
import { RecnodeImpl } from './client/recnode.client.impl.js';
import { RecnodeFake } from './client/recnode.client.fake.js';
import { RecnodeRedis } from './redis/recnode.redis.js';

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
