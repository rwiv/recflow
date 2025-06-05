import { BaseError, Details } from '../base/BaseError.js';

export class ValidationError extends BaseError {
  constructor(message: string, details?: Details) {
    super(message, details, { type: 'Unprocessable Entity' });
  }
}
