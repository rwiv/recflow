import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config.module.js';
import { NodeService } from './node.service.js';
import { TrackedLiveService } from './tracked-live.service.js';
import { LivePersistenceModule } from '../persistence/persistence.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveEventModule } from '../event/event.module.js';
import { PlatformNodeSelector } from './node.selector.js';
import { NodeModule } from '../node/node.module.js';
import { ChannelBusinessModule } from '../../channel/business/business.module.js';

@Module({
  imports: [
    ConfigModule,
    LivePersistenceModule,
    PlatformModule,
    NodeModule,
    LiveEventModule,
    ChannelBusinessModule,
  ],
  providers: [NodeService, TrackedLiveService, PlatformNodeSelector],
  exports: [NodeService, TrackedLiveService],
})
export class LiveBusinessModule {}
