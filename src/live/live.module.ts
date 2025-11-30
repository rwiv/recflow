import { Module } from '@nestjs/common';

import { LiveWebModule } from '@/live/web/live.web.module.js';

@Module({
  imports: [LiveWebModule],
})
export class LiveModule {}
