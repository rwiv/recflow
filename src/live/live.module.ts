import { Module } from '@nestjs/common';
import { LiveWebModule } from './web/live.web.module.js';
import { LiveTaskModule } from './task/live.task.module.js';

@Module({
  imports: [LiveWebModule, LiveTaskModule],
})
export class LiveModule {}
