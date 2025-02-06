import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config.module.js';
import { NodeFactory } from './node.factory.js';
import { NodeSelector } from './node.selector.js';
import { ChannelPriorityModule } from '../../channel/priority/priority.module.js';

export const NODE_SELECTOR_CHZZK = 'NodeSelectorChzzk';
export const NODE_SELECTOR_SOOP = 'NodeSelectorSoop';

@Module({
  imports: [ConfigModule, ChannelPriorityModule],
  providers: [
    NodeFactory,
    {
      provide: NODE_SELECTOR_CHZZK,
      useFactory: (factory: NodeFactory) => factory.createChzzkNodeSelector(),
      inject: [NodeFactory],
    },
    {
      provide: NODE_SELECTOR_SOOP,
      useFactory: (factory: NodeFactory) => factory.createSoopNodeSelector(),
      inject: [NodeFactory],
    },
    NodeSelector,
  ],
  exports: [NODE_SELECTOR_CHZZK, NODE_SELECTOR_SOOP, NodeSelector],
})
export class NodeModule {}
