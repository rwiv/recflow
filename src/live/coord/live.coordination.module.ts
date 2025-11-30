import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { NotifierModule } from '@/external/notify/notifier.module.js';
import { RecnodeModule } from '@/external/recnode/recnode.module.js';

import { PlatformModule } from '@/platform/platform.module.js';

import { NodeServiceModule } from '@/node/service/node.service.module.js';
import { NodeStorageModule } from '@/node/storage/node.storage.module.js';

import { LiveBalancer } from '@/live/coord/live.balancer.js';
import { LiveCleaner } from '@/live/coord/live.cleaner.js';
import { LiveDrainer } from '@/live/coord/live.drainer.js';
import { LiveRecoveryManager } from '@/live/coord/live.recovery.js';
import { LiveDataModule } from '@/live/data/live.data.module.js';
import { LiveRegisterModule } from '@/live/register/live.register.module.js';

@Module({
  imports: [
    ConfigModule,
    PlatformModule,
    NodeStorageModule,
    NodeServiceModule,
    LiveDataModule,
    LiveRegisterModule,
    RecnodeModule,
    NotifierModule,
  ],
  providers: [LiveCleaner, LiveRecoveryManager, LiveDrainer, LiveBalancer],
  exports: [LiveCleaner, LiveRecoveryManager, LiveDrainer, LiveBalancer],
})
export class LiveCoordinationModule {}
