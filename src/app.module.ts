import { Module } from '@nestjs/common';
import { AppService } from './server/app.service.js';
import { AppController } from './server/app.controller.js';
import { ConfigModule } from './common/common.module.js';
import { ClientModule } from './client/client.module.js';
import { StorageModule } from './storage/stroage.module.js';
import { ObserverModule } from './observer/observer.module.js';

@Module({
  imports: [ConfigModule, ClientModule, StorageModule, ObserverModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
