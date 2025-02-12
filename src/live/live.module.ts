import { Module } from '@nestjs/common';
import { LiveWebModule } from './web/live.web.module.js';
import { LiveRegistryModule } from './registry/live.registry.module.js';

@Module({
  imports: [LiveWebModule, LiveRegistryModule],
})
export class LiveModule {}
