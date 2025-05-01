import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LiveModule } from './live/live.module.js';
import { ChannelModule } from './channel/channel.module.js';
import { InitModule } from './common/init/init.module.js';
import { NodeModule } from './node/node.module.js';
import { CriterionModule } from './criterion/criterion.module.js';
import { TaskModule } from './task/task.module.js';
import { PlatformModule } from './platform/platform.module.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
    }),
    InitModule,
    PlatformModule,
    LiveModule,
    ChannelModule,
    NodeModule,
    CriterionModule,
    TaskModule,
  ],
})
export class AppModule {}
