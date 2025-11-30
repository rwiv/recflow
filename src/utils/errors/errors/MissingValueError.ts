import { BaseError, Details } from '@/utils/errors/base/BaseError.js';

export class MissingValueError extends BaseError {
  constructor(message: string, details?: Details) {
    super(message, details, { type: 'Not Found' });
  }
}
