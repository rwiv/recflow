import { Module } from '@nestjs/common';
import { Streamq } from './streamq.js';
import { ConfigModule } from '../common/common.module.js';
import { Amqp } from './amqp.js';
import { MockNotifier, NtfyNotifier } from './notifier.js';
import { Redis } from './redis.js';
import { StdlImpl, StdlMock } from './stdl.js';
import { AuthedImpl, AuthedMock } from './authed.js';

export const STDL = 'Stdl';
export const AUTHED = 'Authed';
export const NOTIFIER = 'Notifier';

@Module({
  imports: [ConfigModule],
  providers: [
    Amqp,
    Redis,
    Streamq,
    {
      provide: STDL,
      useClass: process.env.NODE_ENV === 'prod' ? StdlImpl : StdlMock,
    },
    {
      provide: AUTHED,
      useClass: process.env.NODE_ENV === 'prod' ? AuthedImpl : AuthedMock,
    },
    {
      provide: NOTIFIER,
      useClass: process.env.NODE_ENV === 'prod' ? NtfyNotifier : MockNotifier,
    },
  ],
  exports: [Amqp, Redis, Streamq, STDL, AUTHED, NOTIFIER],
})
export class ClientModule {}
