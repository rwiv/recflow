import { Module } from '@nestjs/common';

import { GlobalController } from '@/common/global/global.controller.js';

@Module({
  controllers: [GlobalController],
})
export class GlobalModule {}
