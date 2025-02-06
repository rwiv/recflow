import { BaseError } from '../base/BaseError.js';

export class ValidationError extends BaseError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 'Unprocessable Entity');
  }
}
