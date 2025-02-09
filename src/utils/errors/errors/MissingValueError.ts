import { BaseError } from '../base/BaseError.js';

export class MissingValueError extends BaseError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 'Not Found');
  }
}
