import { Module } from '@nestjs/common';
import { TagCommandRepository } from './tag.command.js';
import { TagQueryRepository } from './tag.query.js';

@Module({
  imports: [],
  providers: [TagCommandRepository, TagQueryRepository],
  exports: [TagCommandRepository, TagQueryRepository],
})
export class ChannelTagPersistenceModule {}
