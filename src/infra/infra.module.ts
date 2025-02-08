import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { InfraFactory } from './infra.factory.js';
import { NtfyNotifier } from './notify/notifier.ntfy.js';
import { MockNotifier } from './notify/notifier.mock.js';
import { StdlMock } from './stdl/stdl.mock.js';
import { StdlImpl } from './stdl/stdl.impl.js';
import { AuthedMock } from './authed/authed.mock.js';
import { AuthedImpl } from './authed/authed.impl.js';

export const STDL = 'Stdl';
export const AUTHED = 'Authed';
export const NOTIFIER = 'Notifier';
export const AMQP = 'AMQP';

@Module({
  imports: [ConfigModule],
  providers: [
    InfraFactory,
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
      useFactory: (factory: InfraFactory) => {
        return factory.createAmqp();
      },
      inject: [InfraFactory],
    },
  ],
  exports: [STDL, AUTHED, NOTIFIER, AMQP],
})
export class InfraModule {}
