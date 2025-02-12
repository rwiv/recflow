import { Module } from '@nestjs/common';
import { LiveService } from './live.service.js';
import { LivePersistenceModule } from '../persistence/persistence.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveEventModule } from '../event/event.module.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { NodeAppModule } from '../../node/app/node.app.module.js';
import { LiveWriter } from './live.writer.js';
import { LiveMapper } from './live.mapper.js';
import { LiveFinder } from './live.finder.js';

@Module({
  imports: [LivePersistenceModule, ChannelBusinessModule, NodeAppModule, PlatformModule, LiveEventModule],
  providers: [LiveService, LiveWriter, LiveFinder, LiveMapper],
  exports: [LiveService, LiveWriter, LiveFinder],
})
export class LiveBusinessModule {}
