import { HttpError } from './base/HttpError.js';
import { ErrorTypeToHttpStatus } from './types/records.js';
import { HttpStatusCode } from './types/types.js';
import { BaseErrorResolver } from './resolver.base.js';

const DEFAULT_HTTP_ERROR_STATUS = 500;

export class HttpErrorResolver {
  private resolver: BaseErrorResolver;

  constructor() {
    this.resolver = new BaseErrorResolver();
  }

  resolve(srcErr: unknown): HttpError {
    const err = this.resolver.resolve(srcErr);

    if (err instanceof HttpError) {
      return err;
    }

    let status: HttpStatusCode = DEFAULT_HTTP_ERROR_STATUS;
    if (err.type) {
      status = ErrorTypeToHttpStatus[err.type];
    }
    const details = { cause: err, attr: err.attr };
    const meta = { type: err.type, code: err.code };
    return new HttpError(err.message, status, details, meta);
  }
}
