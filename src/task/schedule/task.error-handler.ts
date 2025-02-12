import { Injectable } from '@nestjs/common';
import { BaseErrorResolver } from '../../utils/errors/resolver.base.js';

@Injectable()
export class TaskErrorHandler {
  readonly resolver = new BaseErrorResolver();

  handle(raw: unknown) {
    const err = this.resolver.resolve(raw);
    // TODO: send message
    console.error(err);
  }
}
