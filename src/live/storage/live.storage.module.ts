import { Module } from '@nestjs/common';
import { LiveRepository } from './live.repository.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';

@Module({
  imports: [ChannelServiceModule, NodeServiceModule],
  providers: [LiveRepository],
  exports: [LiveRepository],
})
export class LiveStorageModule {}
