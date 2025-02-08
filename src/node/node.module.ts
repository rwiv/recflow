import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { NodeSelector } from './node.selector.js';
import { ChannelPriorityModule } from '../channel/priority/priority.module.js';

@Module({
  imports: [ConfigModule, ChannelPriorityModule],
  providers: [NodeSelector],
  exports: [NodeSelector],
})
export class NodeModule {}
