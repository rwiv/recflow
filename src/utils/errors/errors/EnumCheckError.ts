import { BaseError } from '../base/BaseError.js';

export class EnumCheckError extends BaseError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 'Unprocessable Entity');
  }
}
