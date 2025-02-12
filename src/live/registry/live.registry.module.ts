import { Module } from '@nestjs/common';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveEventModule } from '../event/event.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { LiveRegistrar } from './live.registrar.js';
import { LiveAccessModule } from '../access/live.access.module.js';

@Module({
  imports: [LiveAccessModule, ChannelServiceModule, NodeServiceModule, PlatformModule, LiveEventModule],
  providers: [LiveRegistrar],
  exports: [LiveRegistrar],
})
export class LiveRegistryModule {}
