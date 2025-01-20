import { Module } from '@nestjs/common';
import { AppService } from './server/app.service.js';
import { AppController } from './server/app.controller.js';
import { ConfigModule } from './common/common.module.js';
import { ClientModule } from './client/client.module.js';

@Module({
  imports: [ConfigModule, ClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
