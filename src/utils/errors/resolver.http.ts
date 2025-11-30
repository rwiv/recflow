import { HttpError } from '@/utils/errors/base/HttpError.js';
import { BaseErrorResolver } from '@/utils/errors/resolver.base.js';
import { ErrorTypeToHttpStatus } from '@/utils/errors/types/records.js';
import { HttpStatusCode } from '@/utils/errors/types/types.js';

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
