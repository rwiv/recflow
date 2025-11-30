import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { InfraModule } from '@/infra/infra.module.js';

import { NotifierModule } from '@/external/notify/notifier.module.js';
import { RecnodeModule } from '@/external/recnode/recnode.module.js';
import { SQSModule } from '@/external/sqs/sqs.module.js';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelServiceModule } from '@/channel/service/channel.service.module.js';

import { CriterionServiceModule } from '@/criterion/service/criterion.service.module.js';

import { NodeServiceModule } from '@/node/service/node.service.module.js';

import { LiveDataModule } from '@/live/data/live.data.module.js';
import { LiveFinalizer } from '@/live/register/live.finalizer.js';
import { LiveInitializerImpl } from '@/live/register/live.initializer.impl.js';
import { LiveInitializer } from '@/live/register/live.initializer.js';
import { LiveRegisterHelper } from '@/live/register/live.register-helper.js';
import { LiveRegistrar } from '@/live/register/live.registrar.js';
import { LiveStreamModule } from '@/live/stream/live.stream.module.js';

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
    RecnodeModule,
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
