import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { InfraFactory } from './infra.factory.js';
import { UntfNotifier } from './notify/notifier.untf.js';
import { MockNotifier } from './notify/notifier.mock.js';
import { StdlMock } from './stdl/stdl.mock.js';
import { StdlImpl } from './stdl/stdl.impl.js';
import { AuthedMock } from './authed/authed.mock.js';
import { AuthedImpl } from './authed/authed.impl.js';
import { AMQP, AMQP_HTTP, AUTHED, NOTIFIER, STDL, VTASK } from './infra.tokens.js';
import { VtaskImpl } from './vtask/vtask.impl.js';
import { VtaskMock } from './vtask/vtask.mock.js';

@Module({
  imports: [ConfigModule],
  providers: [
    InfraFactory,
    {
      provide: AUTHED,
      useClass: process.env.NODE_ENV === 'dev' ? AuthedMock : AuthedImpl,
    },
    {
      provide: STDL,
      useClass: process.env.NODE_ENV === 'dev' ? StdlMock : StdlImpl,
    },
    {
      provide: NOTIFIER,
      useClass: process.env.NODE_ENV === 'dev' ? MockNotifier : UntfNotifier,
    },
    {
      provide: AMQP,
      useFactory: (factory: InfraFactory) => {
        return factory.createAmqp();
      },
      inject: [InfraFactory],
    },
    {
      provide: AMQP_HTTP,
      useFactory: (factory: InfraFactory) => {
        return factory.createAmqpHttp();
      },
      inject: [InfraFactory],
    },
    {
      provide: VTASK,
      useClass: process.env.NODE_ENV === 'dev' ? VtaskMock : VtaskImpl,
    },
  ],
  exports: [STDL, AUTHED, NOTIFIER, AMQP, AMQP_HTTP, VTASK],
})
export class InfraModule {}
