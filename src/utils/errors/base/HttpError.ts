import { BaseError } from './BaseError.js';
import { HttpStatusCode } from '../types/types.js';
import { HttpStatusToErrorCode } from '../types/records.js';

export class HttpError extends BaseError {
  readonly status: number;

  constructor(message: string, status: HttpStatusCode, options?: ErrorOptions) {
    super(message, options, HttpStatusToErrorCode[status]);
    this.status = status;
  }
}
