import { HttpError } from './base/HttpError.js';
import { BaseError } from './base/BaseError.js';
import { ErrorTypeToHttpStatus } from './types/records.js';
import { HttpStatusCode } from './types/types.js';
import { ZodError } from 'zod';
import { zodErrMsg } from '../zod.js';

const DEFAULT_HTTP_ERROR_STATUS = 500;

export class HttpErrorResolver {
  resolve(err: unknown): HttpError {
    if (err instanceof ZodError) {
      const status = ErrorTypeToHttpStatus['Unprocessable Entity'];
      return new HttpError(zodErrMsg(err), status, { cause: err });
    }

    if (err instanceof HttpError) {
      return err;
    }

    if (err instanceof BaseError) {
      let status: HttpStatusCode = ErrorTypeToHttpStatus['Internal Server Error'];
      if (err.type) {
        status = ErrorTypeToHttpStatus[err.type];
      }
      return new HttpError(err.message, status, { cause: err });
    }

    if (err instanceof Error) {
      return new HttpError(err.message, DEFAULT_HTTP_ERROR_STATUS, { cause: err });
    }

    return new HttpError('Unknown Error', DEFAULT_HTTP_ERROR_STATUS, { cause: err });
  }
}
