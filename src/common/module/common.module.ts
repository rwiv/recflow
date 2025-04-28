import { Module } from '@nestjs/common';
import { DevInitializer } from './dev-initializer.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { DevInitInjector } from './dev-injector.js';
import { NodeBatchInserter } from '../../batch/insert/insert.node.js';
import { CriterionStorageModule } from '../../criterion/storage/criterion.storage.module.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';
import { CriterionBatchInserter } from '../../batch/insert/insert.criterion.js';
import { ProdInitializer } from './prod-initializer.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [
    InfraModule,
    ChannelServiceModule,
    PlatformModule,
    NodeStorageModule,
    NodeServiceModule,
    CriterionStorageModule,
    CriterionServiceModule,
  ],
  providers: [DevInitializer, ProdInitializer, DevInitInjector, NodeBatchInserter, CriterionBatchInserter],
  exports: [DevInitializer, ProdInitializer],
})
export class CommonModule {}
