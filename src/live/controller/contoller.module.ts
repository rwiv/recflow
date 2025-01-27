import { Module } from '@nestjs/common';
import { LiveServiceModule } from '../service/service.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';

@Module({
  imports: [LiveServiceModule, PlatformModule],
  controllers: [LiveController],
  providers: [],
})
export class LiveControllerModule {}
