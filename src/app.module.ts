import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { createIoRedisClient } from '@/utils/redis.js';

import { readEnv } from '@/common/config/env.js';
import { GlobalModule } from '@/common/global/global.module.js';
import { InitModule } from '@/common/init/init.module.js';

import { taskDefs } from '@/task/spec/task.queue-defs.js';
import { TaskModule } from '@/task/task.module.js';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelModule } from '@/channel/channel.module.js';

import { CriterionModule } from '@/criterion/criterion.module.js';

import { NodeModule } from '@/node/node.module.js';

import { LiveModule } from '@/live/live.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({ rootPath: join(import.meta.dirname, '..', 'public') }),
    BullBoardModule.forRoot({ route: '/queues', adapter: ExpressAdapter }),
    ...getBullModules(),
    InitModule,
    PlatformModule,
    LiveModule,
    ChannelModule,
    NodeModule,
    CriterionModule,
    TaskModule,
    GlobalModule,
  ],
})
export class AppModule {}

function getBullModules() {
  const env = readEnv();
  const bull = createIoRedisClient(env.serverRedis, 1);

  const bullModules = [];
  for (const taskName in taskDefs) {
    bullModules.push(BullModule.registerQueue({ name: taskName, connection: bull }));
    bullModules.push(BullBoardModule.forFeature({ name: taskName, adapter: BullMQAdapter }));
  }
  return bullModules;
}
