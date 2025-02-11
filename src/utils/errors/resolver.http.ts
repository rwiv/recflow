import { HttpError } from './base/HttpError.js';
import { BaseError } from './base/BaseError.js';
import { ErrorTypeToHttpStatus } from './types/records.js';
import { HttpStatusCode } from './types/types.js';
import { ZodError } from 'zod';
import { zodErrMsg } from '../zod.js';
import { log } from 'jslog';
import { stackTrace } from './utils.js';

const DEFAULT_HTTP_ERROR_STATUS = 500;

export class HttpErrorResolver {
  resolve(err: unknown): HttpError {
    if (err instanceof ZodError) {
      const status = ErrorTypeToHttpStatus['Unprocessable Entity'];
      const message = zodErrMsg(err);
      log.error(err.name, { message });
      return new HttpError(message, status, { cause: err });
    }

    if (err instanceof HttpError) {
      const { message, status, type, code } = err;
      log.error(err.name, { message, status, type, code, stack: stackTrace(err) });
      return err;
    }

    if (err instanceof BaseError) {
      const { message, type, code } = err;
      log.error(err.name, { message, type, code, stack: stackTrace(err) });
      let status: HttpStatusCode = ErrorTypeToHttpStatus['Internal Server Error'];
      if (err.type) {
        status = ErrorTypeToHttpStatus[err.type];
      }
      return new HttpError(err.message, status, { cause: err });
    }

    if (err instanceof Error) {
      log.error(err.name, { message: err.message, stack: stackTrace(err) });
      return new HttpError(err.message, DEFAULT_HTTP_ERROR_STATUS, { cause: err });
    }

    console.error('UnknownError', err);
    return new HttpError('UnknownError', DEFAULT_HTTP_ERROR_STATUS, { cause: err });
  }
}
