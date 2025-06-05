import { Injectable } from '@nestjs/common';
import { BaseErrorResolver } from '../../utils/errors/resolver.base.js';
import { log } from 'jslog';
import { stacktrace } from '../../utils/errors/utils.js';

@Injectable()
export class TaskErrorHandler {
  readonly resolver = new BaseErrorResolver();

  handle(raw: unknown) {
    const err = this.resolver.resolve(raw);
    // TODO: add send message
    log.error(err.message, { ...err.attr, stacktrace: stacktrace(err) });
  }
}
