import { Module } from '@nestjs/common';
import { NodeService } from './node.service.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodePersistenceModule } from '../persistence/node.persistence.module.js';

@Module({
  imports: [NodePersistenceModule, PlatformModule],
  providers: [NodeService],
  exports: [],
})
export class NodeBusinessModule {}
