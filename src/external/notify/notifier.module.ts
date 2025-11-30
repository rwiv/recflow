import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { FakeNotifier } from '@/external/notify/notifier.fake.js';
import { Notifier } from '@/external/notify/notifier.js';
import { UntfNotifier } from '@/external/notify/notifier.untf.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Notifier,
      useClass: process.env.NODE_ENV === 'dev' ? FakeNotifier : UntfNotifier,
    },
  ],
  exports: [Notifier],
})
export class NotifierModule {}
