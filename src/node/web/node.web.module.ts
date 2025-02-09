import { Module } from '@nestjs/common';
import { NodeBusinessModule } from '../business/node.business.module.js';
import { NodeController } from './node.controller.js';

@Module({
  imports: [NodeBusinessModule],
  providers: [NodeController],
})
export class NodeWebModule {}
