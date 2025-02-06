import { BaseError } from '../base/BaseError.js';

export class ParsingError extends BaseError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 'Unprocessable Entity');
  }
}
