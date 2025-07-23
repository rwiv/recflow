import { Module } from '@nestjs/common';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { LiveDataModule } from '../data/live.data.module.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveRegisterModule } from '../register/live.register.module.js';
import { LiveCleaner } from './live.cleaner.js';
import { LiveDrainer } from './live.drainer.js';
import { LiveBalancer } from './live.balancer.js';
import { LiveRecoveryManager } from './live.recovery.js';

@Module({
  imports: [
    ConfigModule,
    InfraModule,
    PlatformModule,
    NodeStorageModule,
    NodeServiceModule,
    LiveDataModule,
    LiveRegisterModule,
  ],
  providers: [LiveCleaner, LiveRecoveryManager, LiveDrainer, LiveBalancer],
  exports: [LiveCleaner, LiveRecoveryManager, LiveDrainer, LiveBalancer],
})
export class LiveCoordinateModule {}
