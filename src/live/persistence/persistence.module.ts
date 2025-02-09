import { Module } from '@nestjs/common';
import { LiveRepository } from './live.repository.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { NodeBusinessModule } from '../../node/business/node.business.module.js';

@Module({
  imports: [ChannelBusinessModule, NodeBusinessModule],
  providers: [LiveRepository],
  exports: [LiveRepository],
})
export class LivePersistenceModule {}
