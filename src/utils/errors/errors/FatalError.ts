import { BaseError, Details, Metadata } from '@/utils/errors/base/BaseError.js';

export class FatalError extends BaseError {
  constructor(message: string, details?: Details, meta?: Metadata) {
    super(message, details, meta);
  }
}
