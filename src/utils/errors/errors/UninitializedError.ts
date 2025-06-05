import { BaseError, Details, Metadata } from '../base/BaseError.js';

export class UninitializedError extends BaseError {
  constructor(message: string, details?: Details, meta?: Metadata) {
    super(message, details, meta);
  }
}
