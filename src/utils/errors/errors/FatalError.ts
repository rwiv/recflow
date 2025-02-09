import { BaseError } from '../base/BaseError.js';
import { ErrorType } from '../types/types.js';

export class FatalError extends BaseError {
  constructor(message: string, options?: ErrorOptions, code?: ErrorType) {
    super(message, options, code);
  }
}
