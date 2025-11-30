import { ZodError } from 'zod';

import { BaseError } from '@/utils/errors/base/BaseError.js';
import { ErrorType } from '@/utils/errors/types/types.js';
import { zodErrMsg } from '@/utils/zod.js';

const BASE_ERROR_TYPE: ErrorType = 'Internal Server Error';

export class BaseErrorResolver {
  resolve(err: unknown): BaseError {
    if (err instanceof BaseError) {
      return err;
    }

    if (err instanceof ZodError) {
      const message = zodErrMsg(err);
      return new BaseError(message, { cause: err }, { type: 'Unprocessable Entity' });
    }

    if (err instanceof Error) {
      return new BaseError(err.message, { cause: err }, { type: BASE_ERROR_TYPE });
    }

    return new BaseError('UnknownError', { cause: err }, { type: BASE_ERROR_TYPE });
  }
}
