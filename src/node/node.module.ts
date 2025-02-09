import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { NodeSelector } from './node.selector.js';
import { ChannelPriorityModule } from '../channel/priority/priority.module.js';
import { NodePersistenceModule } from './persistence/node.persistence.module.js';
import { NodeBusinessModule } from './business/node.business.module.js';
import { NodeWebModule } from './web/node.web.module.js';

@Module({
  imports: [
    ConfigModule,
    ChannelPriorityModule,
    NodePersistenceModule,
    NodeBusinessModule,
    NodeWebModule,
  ],
  providers: [NodeSelector],
  exports: [NodeSelector],
})
export class NodeModule {}
