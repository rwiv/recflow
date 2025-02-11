import { BaseError } from './BaseError.js';

export class HttpError extends BaseError {
  readonly status: number;

  constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, options);
    this.status = status;
  }
}
