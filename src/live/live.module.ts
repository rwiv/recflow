import { Module } from '@nestjs/common';
import { LiveSchedulerModule } from './scheduler/scheduler.module.js';
import { LiveWebModule } from './web/live.web.module.js';
import { LiveRegistryModule } from './registry/live.registry.module.js';

@Module({
  imports: [LiveSchedulerModule, LiveWebModule, LiveRegistryModule],
})
export class LiveModule {}
