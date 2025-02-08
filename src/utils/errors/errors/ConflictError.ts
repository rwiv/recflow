import { BaseError } from '../base/BaseError.js';

export class ConflictError extends BaseError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 'Conflict');
  }
}
