import { Module } from '@nestjs/common';
import { LiveAccessModule } from '../access/live.access.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';
import { LiveRegistryModule } from '../registry/live.registry.module.js';

@Module({
  imports: [LiveAccessModule, LiveRegistryModule, PlatformModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
