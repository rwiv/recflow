import { BaseError } from '../base/BaseError.js';
import { ErrorCode } from '../types/types.js';

export class FatalError extends BaseError {
  constructor(message: string, options?: ErrorOptions, code?: ErrorCode) {
    super(message, options, code);
  }
}
