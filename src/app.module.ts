import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LiveModule } from './live/live.module.js';
import { ChannelModule } from './channel/channel.module.js';
import { CommonModule } from './common/module/common.module.js';
import { NodeModule } from './node/node.module.js';
import { CriterionModule } from './criterion/criterion.module.js';
import { TaskModule } from './task/task.module.js';
import { PlatformModule } from './platform/platform.module.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
    }),
    CommonModule,
    PlatformModule,
    LiveModule,
    ChannelModule,
    NodeModule,
    CriterionModule,
    TaskModule,
  ],
})
export class AppModule {}
