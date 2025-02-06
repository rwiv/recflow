import { BaseError } from '../base/BaseError.js';

export class NotFoundError extends BaseError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 'Not Found');
  }
}
