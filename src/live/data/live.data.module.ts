import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { NotifierModule } from '@/external/notify/notifier.module.js';
import { RecnodeModule } from '@/external/recnode/recnode.module.js';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelServiceModule } from '@/channel/service/channel.service.module.js';

import { NodeServiceModule } from '@/node/service/node.service.module.js';
import { NodeStorageModule } from '@/node/storage/node.storage.module.js';

import { LiveFinder } from '@/live/data/live.finder.js';
import { LiveMapper } from '@/live/data/live.mapper.js';
import { LiveRefresher } from '@/live/data/live.refresher.js';
import { LiveStateCleaner } from '@/live/data/live.state.cleaner.js';
import { LiveWriter } from '@/live/data/live.writer.js';
import { LiveStorageModule } from '@/live/storage/live.storage.module.js';
import { LiveStreamModule } from '@/live/stream/live.stream.module.js';

@Module({
  imports: [
    ConfigModule,
    PlatformModule,
    ChannelServiceModule,
    NodeStorageModule,
    NodeServiceModule,
    LiveStorageModule,
    LiveStreamModule,
    RecnodeModule,
    NotifierModule,
  ],
  providers: [LiveMapper, LiveWriter, LiveFinder, LiveRefresher, LiveStateCleaner],
  exports: [LiveWriter, LiveFinder, LiveRefresher, LiveStateCleaner],
})
export class LiveDataModule {}
