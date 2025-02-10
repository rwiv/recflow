import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LiveModule } from './live/live.module.js';
import { ChannelModule } from './channel/channel.module.js';
import { CommonModule } from './common/module/common.module.js';
import { NodeModule } from './node/node.module.js';
import { CriterionModule } from './criterion/criterion.module.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
    }),
    CommonModule,
    LiveModule,
    ChannelModule,
    NodeModule,
    CriterionModule,
  ],
})
export class AppModule {}
