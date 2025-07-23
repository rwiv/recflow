import { Module } from '@nestjs/common';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { LiveRegistrar } from './live.registrar.js';
import { LiveDataModule } from '../data/live.data.module.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveFinalizer } from './live.finalizer.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';
import { LiveInitializer } from './live.initializer.js';
import { LiveRegisterHelper } from './live.register-helper.js';
import { LiveStreamModule } from '../stream/live.stream.module.js';

@Module({
  imports: [
    ConfigModule,
    InfraModule,
    PlatformModule,
    ChannelServiceModule,
    NodeServiceModule,
    CriterionServiceModule,
    LiveDataModule,
    LiveStreamModule,
  ],
  providers: [LiveRegistrar, LiveInitializer, LiveFinalizer, LiveRegisterHelper],
  exports: [LiveRegistrar, LiveInitializer, LiveFinalizer, LiveRegisterHelper],
})
export class LiveRegisterModule {}
