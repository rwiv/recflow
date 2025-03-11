import { ZodError } from 'zod';
import { zodErrMsg } from '../zod.js';
import { BaseError } from './base/BaseError.js';
import { ErrorType } from './types/types.js';

const BASE_ERROR_TYPE: ErrorType = 'Internal Server Error';

export class BaseErrorResolver {
  resolve(err: unknown): BaseError {
    if (err instanceof BaseError) {
      return err;
    }

    if (err instanceof ZodError) {
      const message = zodErrMsg(err);
      return new BaseError(message, { cause: err }, 'Unprocessable Entity');
    }

    if (err instanceof Error) {
      return new BaseError(err.message, { cause: err }, BASE_ERROR_TYPE);
    }

    return new BaseError('UnknownError', { cause: err }, BASE_ERROR_TYPE);
  }
}
