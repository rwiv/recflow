import { Module } from '@nestjs/common';
import { ChannelTagBusinessModule } from './business/business.module.js';
import { ChannelTagPersistenceModule } from './persistence/persistence.module.js';
import { ChannelTagWebModule } from './web/web.module.js';

@Module({
  imports: [ChannelTagWebModule, ChannelTagBusinessModule, ChannelTagPersistenceModule],
})
export class ChannelTagModule {}
