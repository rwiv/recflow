import { Module } from '@nestjs/common';
import { AppController } from './server/app.controller.js';
import { ConfigModule } from './common/common.module.js';
import { ClientModule } from './client/client.module.js';
import { ServiceModule } from './service/service.module.js';
import { ObserverModule } from './observer/observer.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PlatformModule } from './platform/platform.module.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
    }),
    ConfigModule,
    ClientModule,
    ServiceModule,
    ObserverModule,
    PlatformModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
