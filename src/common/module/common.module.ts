import { Module } from '@nestjs/common';
import { AppInitializer } from './initializer.js';
import { ChannelPersistenceModule } from '../../channel/channel/persistence/channel.persistence.module.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodePersistenceModule } from '../../node/persistence/node.persistence.module.js';
import { NodeBusinessModule } from '../../node/business/node.business.module.js';
import { DevInitInjector } from './dev-injector.js';
import { NodeBatchInserter } from '../../batch/insert/insert.node.js';
import { CriterionPersistenceModule } from '../../criterion/persistence/criterion.persistence.module.js';
import { CriterionBusinessModule } from '../../criterion/business/criterion.business.module.js';
import { CriterionBatchInserter } from '../../batch/insert/insert.criterion.js';

@Module({
  imports: [
    ChannelPersistenceModule,
    ChannelBusinessModule,
    PlatformModule,
    NodePersistenceModule,
    NodeBusinessModule,
    CriterionPersistenceModule,
    CriterionBusinessModule,
  ],
  providers: [AppInitializer, DevInitInjector, NodeBatchInserter, CriterionBatchInserter],
  exports: [AppInitializer],
})
export class CommonModule {}
