import { Module } from '@nestjs/common';

import { ChannelWebModule } from '@/channel/web/channel.web.module.js';

@Module({
  imports: [ChannelWebModule],
})
export class ChannelModule {}
