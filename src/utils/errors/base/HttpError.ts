import { BaseError } from './BaseError.js';
import { HttpStatusCode } from '../types/types.js';
import { HttpStatusToErrorType } from '../types/records.js';

export class HttpError extends BaseError {
  readonly status: number;

  constructor(message: string, status: HttpStatusCode, options?: ErrorOptions) {
    super(message, options, HttpStatusToErrorType[status]);
    this.status = status;
  }
}
