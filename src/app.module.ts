import { Module } from '@nestjs/common';
import { AppController } from './server/app.controller.js';
import { ConfigModule } from './common/common.module.js';
import { ClientModule } from './client/client.module.js';
import { StorageModule } from './storage/stroage.module.js';
import { ObserverModule } from './observer/observer.module.js';
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', '..', 'public'),
    }),
    ConfigModule, ClientModule, StorageModule, ObserverModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
