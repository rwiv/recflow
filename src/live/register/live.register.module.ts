import { Module } from '@nestjs/common';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { LiveRegistrar } from './live.registrar.js';
import { LiveDataModule } from '../data/live.data.module.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { LiveFinalizer } from './live.finalizer.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';
import { LiveInitializerImpl } from './live.initializer.impl.js';
import { LiveStreamModule } from '../stream/live.stream.module.js';
import { LiveInitializer } from './live.initializer.js';
import { LiveRegisterHelper } from './live.register-helper.js';
import { StdlModule } from '../../external/stdl/stdl.module.js';
import { NotifierModule } from '../../external/notify/notifier.module.js';
import { SQSModule } from '../../external/sqs/sqs.module.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [
    InfraModule,
    ConfigModule,
    PlatformModule,
    ChannelServiceModule,
    NodeServiceModule,
    CriterionServiceModule,
    LiveDataModule,
    LiveStreamModule,
    StdlModule,
    NotifierModule,
    SQSModule,
  ],
  providers: [
    LiveRegistrar,
    LiveFinalizer,
    LiveRegisterHelper,
    {
      provide: LiveInitializer,
      useClass: LiveInitializerImpl,
    },
  ],
  exports: [LiveRegistrar, LiveFinalizer, LiveInitializer],
})
export class LiveRegisterModule {}
