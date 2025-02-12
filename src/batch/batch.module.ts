import { Module } from '@nestjs/common';
import { ChannelBatchInserter } from './insert/insert.channel.js';
import { ChannelBusinessModule } from '../channel/channel/business/channel.business.module.js';
import { CommonModule } from '../common/module/common.module.js';
import { ChannelTagPersistenceModule } from '../channel/tag/persistence/tag.persistence.module.js';
import { ChannelBatchMigrator } from './migrate/migrate.channel.js';
import { NodeBatchInserter } from './insert/insert.node.js';
import { NodeAppModule } from '../node/app/node.app.module.js';
import { CriterionBatchInserter } from './insert/insert.criterion.js';

@Module({
  imports: [CommonModule, ChannelBusinessModule, ChannelTagPersistenceModule, NodeAppModule],
  providers: [ChannelBatchInserter, NodeBatchInserter, CriterionBatchInserter, ChannelBatchMigrator],
})
export class BatchModule {}
