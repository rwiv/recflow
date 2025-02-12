import { Module } from '@nestjs/common';
import { NodeServiceModule } from '../service/node.service.module.js';
import { NodeController } from './node.controller.js';

@Module({
  imports: [NodeServiceModule],
  controllers: [NodeController],
})
export class NodeWebModule {}
