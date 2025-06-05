import { BaseError, Details } from '../base/BaseError.js';

export class ConflictError extends BaseError {
  constructor(message: string, details?: Details) {
    super(message, details, { type: 'Conflict' });
  }
}
