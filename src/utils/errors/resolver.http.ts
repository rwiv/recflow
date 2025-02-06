import { HttpError } from './base/HttpError.js';
import { BaseError } from './base/BaseError.js';
import { ErrorCodeToHttpStatus } from './types/records.js';
import { HttpStatusCode } from './types/types.js';

const DEFAULT_HTTP_ERROR_STATUS = 500;

export class HttpErrorResolver {
  resolve(err: unknown) {
    if (err instanceof HttpError) {
      return err;
    }

    if (err instanceof BaseError) {
      let status: HttpStatusCode = 500;
      if (err.code) {
        status = ErrorCodeToHttpStatus[err.code];
      }
      return new HttpError(err.message, status, { cause: err });
    }

    if (err instanceof Error) {
      return new HttpError(err.message, DEFAULT_HTTP_ERROR_STATUS, { cause: err });
    }

    return new HttpError('Unknown Error', DEFAULT_HTTP_ERROR_STATUS, { cause: err });
  }
}
