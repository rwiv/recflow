import { BaseError, Details, Metadata } from '@/utils/errors/base/BaseError.js';

export class UninitializedError extends BaseError {
  constructor(message: string, details?: Details, meta?: Metadata) {
    super(message, details, meta);
  }
}
