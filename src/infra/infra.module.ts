import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { InfraFactory } from './infra.factory.js';
import { UntfNotifier } from './notify/notifier.untf.js';
import { MockNotifier } from './notify/notifier.mock.js';
import { StdlMock } from './stdl/stdl.client.mock.js';
import { StdlImpl } from './stdl/stdl.client.impl.js';
import { AuthedMock } from './authed/authed.mock.js';
import { AuthedImpl } from './authed/authed.impl.js';
import { AUTHED, NOTIFIER, STDL, STDL_REDIS, VTASK } from './infra.tokens.js';
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
      provide: STDL_REDIS,
      useFactory: (factory: InfraFactory) => {
        return factory.createStdlRedis();
      },
      inject: [InfraFactory],
    },
    {
      provide: NOTIFIER,
      useClass: process.env.NODE_ENV === 'dev' ? MockNotifier : UntfNotifier,
    },
    {
      provide: VTASK,
      useClass: process.env.NODE_ENV === 'dev' ? VtaskMock : VtaskImpl,
    },
  ],
  exports: [STDL, STDL_REDIS, AUTHED, NOTIFIER, VTASK],
})
export class InfraModule {}
