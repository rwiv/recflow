import { Module } from '@nestjs/common';
import { TagCommandRepository } from './tag.persistence.command.js';
import { TagQueryRepository } from './tag.query.js';

@Module({
  imports: [],
  providers: [TagCommandRepository, TagQueryRepository],
  exports: [TagCommandRepository, TagQueryRepository],
})
export class ChannelTagPersistenceModule {}
