import { Inject, Injectable } from '@nestjs/common';
import { LiveRegistrar } from './live.registrar.js';
import { AMQP_HTTP } from '../../infra/infra.module.js';
import { AmqpHttp } from '../../infra/amqp/amqp.interface.js';

@Injectable()
export class LiveChecker {
  constructor(
    @Inject(AMQP_HTTP) private readonly amqpHttp: AmqpHttp,
    private readonly registrar: LiveRegistrar,
  ) {}

  async check() {}
}
