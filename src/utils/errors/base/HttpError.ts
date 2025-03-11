import { BaseError } from './BaseError.js';
import { ErrorType } from '../types/types.js';

export class HttpError extends BaseError {
  readonly status: number;

  constructor(message: string, status: number, options?: ErrorOptions, type?: ErrorType, code?: string) {
    super(message, options, type, code);
    this.status = status;
  }
}
