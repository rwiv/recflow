import { Module } from '@nestjs/common';
import { DevInitializer } from './dev-initializer.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { DevChannelInserter } from './insert/insert.channel.js';
import { DevNodeInserter } from './insert/insert.node.js';
import { CriterionStorageModule } from '../../criterion/storage/criterion.storage.module.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';
import { DevCriterionInserter } from './insert/insert.criterion.js';
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
  providers: [DevInitializer, ProdInitializer, DevChannelInserter, DevNodeInserter, DevCriterionInserter],
  exports: [DevInitializer, ProdInitializer],
})
export class InitModule {}
