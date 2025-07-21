import { Injectable } from '@nestjs/common';
import { BaseErrorResolver } from '../../utils/errors/resolver.base.js';
import { log } from 'jslog';
import { stacktrace } from '../../utils/errors/utils.js';

@Injectable()
export class TaskErrorHandler {
  readonly resolver = new BaseErrorResolver();

  handle(err: unknown) {
    const resolved = this.resolver.resolve(err);
    log.error(resolved.message, { ...resolved.attr, stack_trace: stacktrace(resolved) });
    throw err;
  }
}
