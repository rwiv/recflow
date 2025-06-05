import { BaseError, Details, Metadata } from '../base/BaseError.js';

export class FatalError extends BaseError {
  constructor(message: string, details?: Details, meta?: Metadata) {
    super(message, details, meta);
  }
}
