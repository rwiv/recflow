import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { Notifier } from './notifier.js';
import { FakeNotifier } from './notifier.fake.js';
import { UntfNotifier } from './notifier.untf.js';

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
