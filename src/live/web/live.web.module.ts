import { Module } from '@nestjs/common';
import { LiveAccessModule } from '../access/live.access.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveController } from './live.controller.js';
import { LiveRegistryModule } from '../registry/live.registry.module.js';
import { LiveTaskModule } from '../task/live.task.module.js';

@Module({
  imports: [LiveAccessModule, LiveRegistryModule, PlatformModule, LiveTaskModule],
  controllers: [LiveController],
})
export class LiveWebModule {}
