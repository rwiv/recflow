import { Module } from '@nestjs/common';
import { ChannelBatchInserter } from './insert/insert.channel.js';
import { ChannelServiceModule } from '../channel/service/channel.service.module.js';
import { CommonModule } from '../common/module/common.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { ChannelBatchMigrator } from './migrate/migrate.channel.js';
import { NodeBatchInserter } from './insert/insert.node.js';
import { NodeServiceModule } from '../node/service/node.service.module.js';
import { CriterionBatchInserter } from './insert/insert.criterion.js';
import { ChannelStorageModule } from '../channel/storage/channel.storage.module.js';
import { CriterionServiceModule } from '../criterion/service/criterion.service.module.js';

@Module({
  imports: [
    CommonModule,
    PlatformModule,
    ChannelServiceModule,
    ChannelStorageModule,
    NodeServiceModule,
    CriterionServiceModule,
  ],
  providers: [ChannelBatchInserter, NodeBatchInserter, CriterionBatchInserter, ChannelBatchMigrator],
})
export class BatchModule {}
