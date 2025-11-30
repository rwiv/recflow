import { Module } from '@nestjs/common';

import { NodeWebModule } from '@/node/web/node.web.module.js';

@Module({
  imports: [NodeWebModule],
})
export class NodeModule {}
