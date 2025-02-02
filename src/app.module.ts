import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LiveModule } from './live/live.module.js';
import { ChannelModule } from './channel/channel.module.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
    }),
    LiveModule,
    ChannelModule,
  ],
})
export class AppModule {}
