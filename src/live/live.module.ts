import { Module } from '@nestjs/common';
import { LiveSchedulerModule } from './scheduler/scheduler.module.js';
import { LiveWebModule } from './web/web.module.js';

@Module({
  imports: [LiveSchedulerModule, LiveWebModule],
  controllers: [],
  providers: [],
})
export class LiveModule {}
