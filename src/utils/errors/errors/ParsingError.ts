import { BaseError, Details } from '../base/BaseError.js';

export class ParsingError extends BaseError {
  constructor(message: string, details?: Details) {
    super(message, details, { type: 'Unprocessable Entity' });
  }
}
