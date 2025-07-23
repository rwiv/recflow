import { Module } from '@nestjs/common';
import { LiveStorageModule } from '../storage/live.storage.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { LiveWriter } from './live.writer.js';
import { LiveMapper } from './live.mapper.js';
import { LiveFinder } from './live.finder.js';
import { LiveRefresher } from './live.refresher.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { LiveStateCleaner } from './live.state.cleaner.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveStreamModule } from '../stream/live.stream.module.js';

@Module({
  imports: [
    ConfigModule,
    InfraModule,
    PlatformModule,
    ChannelServiceModule,
    NodeStorageModule,
    NodeServiceModule,
    LiveStorageModule,
    LiveStreamModule,
  ],
  providers: [LiveMapper, LiveWriter, LiveFinder, LiveRefresher, LiveStateCleaner],
  exports: [LiveWriter, LiveFinder, LiveRefresher, LiveStateCleaner],
})
export class LiveDataModule {}
