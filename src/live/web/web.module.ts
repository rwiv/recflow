import { Module } from '@nestjs/common';
import { LiveBusinessModule } from '../business/business.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';

@Module({
  imports: [LiveBusinessModule, PlatformModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
