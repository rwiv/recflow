import { Injectable } from '@nestjs/common';
import { BaseErrorResolver } from '../../utils/errors/resolver.base.js';
import { log } from 'jslog';
import { stackTrace } from '../../utils/errors/utils.js';

@Injectable()
export class TaskErrorHandler {
  readonly resolver = new BaseErrorResolver();

  handle(raw: unknown) {
    const err = this.resolver.resolve(raw);
    // TODO: add send message
    const { message, type, code } = err;
    log.error(err.name, { message, type, code, stack: stackTrace(err) });
  }
}
