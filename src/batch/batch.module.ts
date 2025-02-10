import { Module } from '@nestjs/common';
import { ChannelBatchInserter } from './insert/insert.channel.js';
import { ChannelBusinessModule } from '../channel/channel/business/channel.business.module.js';
import { CommonModule } from '../common/module/common.module.js';
import { ChannelTagPersistenceModule } from '../channel/tag/persistence/tag.persistence.module.js';
import { ChannelBatchMigrator } from './migrate/migrate.channel.js';
import { NodeBatchInserter } from './insert/insert.node.js';
import { NodeBusinessModule } from '../node/business/node.business.module.js';

@Module({
  imports: [CommonModule, ChannelBusinessModule, ChannelTagPersistenceModule, NodeBusinessModule],
  providers: [ChannelBatchInserter, NodeBatchInserter, ChannelBatchMigrator],
  exports: [ChannelBatchInserter, NodeBatchInserter, ChannelBatchMigrator],
})
export class BatchModule {}
