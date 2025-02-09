import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { LiveService } from './live.service.js';
import { LivePersistenceModule } from '../persistence/persistence.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveEventModule } from '../event/event.module.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { NodeBusinessModule } from '../../node/business/node.business.module.js';
import { LiveWriter } from './live.writer.js';

@Module({
  imports: [
    ConfigModule,
    LivePersistenceModule,
    PlatformModule,
    NodeBusinessModule,
    LiveEventModule,
    ChannelBusinessModule,
  ],
  providers: [LiveService, LiveWriter],
  exports: [LiveService, LiveWriter],
})
export class LiveBusinessModule {}
