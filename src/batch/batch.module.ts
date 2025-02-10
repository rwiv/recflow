import { Module } from '@nestjs/common';
import { BatchInserter } from './insert/inserter.js';
import { ChannelBusinessModule } from '../channel/channel/business/channel.business.module.js';
import { CommonModule } from '../common/module/common.module.js';
import { ChannelTagPersistenceModule } from '../channel/tag/persistence/tag.persistence.module.js';
import { ChannelBatchMigrator } from './migrate/migrate.channel.js';

@Module({
  imports: [CommonModule, ChannelBusinessModule, ChannelTagPersistenceModule],
  providers: [BatchInserter, ChannelBatchMigrator],
  exports: [BatchInserter, ChannelBatchMigrator],
})
export class BatchModule {}
