import { Module } from '@nestjs/common';
import { LiveRepository } from './live.repository.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';

@Module({
  imports: [ChannelBusinessModule, NodeServiceModule],
  providers: [LiveRepository],
  exports: [LiveRepository],
})
export class LiveStorageModule {}
