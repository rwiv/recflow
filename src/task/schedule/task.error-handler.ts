import { Injectable } from '@nestjs/common';
import { log } from 'jslog';

import { HttpRequestError } from '@/utils/errors/errors/HttpRequestError.js';
import { BaseErrorResolver } from '@/utils/errors/resolver.base.js';
import { stacktrace } from '@/utils/errors/utils.js';

@Injectable()
export class TaskErrorHandler {
  readonly resolver = new BaseErrorResolver();

  handle(err: unknown) {
    const resolved = this.resolver.resolve(err);
    const attr = { ...resolved.attr, stack_trace: stacktrace(resolved) };
    if (err instanceof HttpRequestError) {
      log.warn(resolved.message, attr);
    } else {
      log.error(resolved.message, attr);
    }
    throw err;
  }
}
