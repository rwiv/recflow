import { Module } from '@nestjs/common';
import { ChannelTagBusinessModule } from './business/tag.business.module.js';
import { ChannelTagPersistenceModule } from './persistence/tag.persistence.module.js';
import { ChannelTagWebModule } from './web/tag.web.module.js';

@Module({
  imports: [ChannelTagWebModule, ChannelTagBusinessModule, ChannelTagPersistenceModule],
})
export class ChannelTagModule {}
