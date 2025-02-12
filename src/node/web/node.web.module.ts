import { Module } from '@nestjs/common';
import { NodeAppModule } from '../app/node.app.module.js';
import { NodeController } from './node.controller.js';

@Module({
  imports: [NodeAppModule],
  controllers: [NodeController],
})
export class NodeWebModule {}
