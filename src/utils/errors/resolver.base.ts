import { BaseError } from './base/BaseError.js';

export class BaseErrorResolver {
  resolve(err: unknown) {
    if (err instanceof BaseError) {
      return err;
    }

    if (err instanceof Error) {
      return new BaseError(err.message, { cause: err });
    }

    return new BaseError('Unknown Error', { cause: err });
  }
}
