import { BaseError, Details, Metadata } from '@/utils/errors/base/BaseError.js';

export class HttpError extends BaseError {
  readonly status: number;

  constructor(message: string, status: number, details?: Details, meta?: Metadata) {
    super(message, details, meta);
    this.status = status;
  }
}
