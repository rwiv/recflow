import { Module } from '@nestjs/common';

import { DevInitializer } from '@/common/init/dev-initializer.js';
import { DevChannelInserter } from '@/common/init/insert/insert.channel.js';
import { DevCriterionInserter } from '@/common/init/insert/insert.criterion.js';
import { DevNodeInserter } from '@/common/init/insert/insert.node.js';
import { ProdInitializer } from '@/common/init/prod-initializer.js';

import { InfraModule } from '@/infra/infra.module.js';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelServiceModule } from '@/channel/service/channel.service.module.js';

import { CriterionServiceModule } from '@/criterion/service/criterion.service.module.js';
import { CriterionStorageModule } from '@/criterion/storage/criterion.storage.module.js';

import { NodeServiceModule } from '@/node/service/node.service.module.js';
import { NodeStorageModule } from '@/node/storage/node.storage.module.js';

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
