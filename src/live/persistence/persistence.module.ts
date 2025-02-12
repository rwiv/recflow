import { Module } from '@nestjs/common';
import { LiveRepository } from './live.repository.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { NodeAppModule } from '../../node/app/node.app.module.js';

@Module({
  imports: [ChannelBusinessModule, NodeAppModule],
  providers: [LiveRepository],
  exports: [LiveRepository],
})
export class LivePersistenceModule {}
