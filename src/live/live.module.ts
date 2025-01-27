import { Module } from '@nestjs/common';
import { LiveSyncModule } from './sync/sync.module.js';
import { LiveControllerModule } from './controller/contoller.module.js';

@Module({
  imports: [LiveSyncModule, LiveControllerModule],
  controllers: [],
  providers: [],
})
export class LiveModule {}
