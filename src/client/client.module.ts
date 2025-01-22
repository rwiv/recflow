import { Module } from '@nestjs/common';
import { Streamq } from './streamq.js';
import { ConfigModule } from '../common/common.module.js';
import { MockNotifier, NtfyNotifier } from './notifier.js';
import { StdlImpl, StdlMock } from './stdl.js';
import { AuthedImpl, AuthedMock } from './authed.js';
import { ClientFactory } from './client.factory.js';

export const STDL = 'Stdl';
export const AUTHED = 'Authed';
export const NOTIFIER = 'Notifier';
export const AMQP = 'AMQP';

@Module({
  imports: [ConfigModule],
  providers: [
    ClientFactory,
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
    {
      provide: AMQP,
      useFactory: (factory: ClientFactory) => {
        return factory.createAmqp();
      },
      inject: [ClientFactory],
    },
  ],
  exports: [Streamq, STDL, AUTHED, NOTIFIER, AMQP],
})
export class ClientModule {}
