import { Module } from '@nestjs/common';
import { LiveAccessModule } from '../access/live.access.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';
import { LiveSchedulerModule } from '../scheduler/scheduler.module.js';
import { LiveRegistryModule } from '../registry/live.registry.module.js';

@Module({
  imports: [LiveAccessModule, LiveRegistryModule, PlatformModule, LiveSchedulerModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
