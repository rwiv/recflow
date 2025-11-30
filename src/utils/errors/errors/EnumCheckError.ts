import { BaseError, Details } from '@/utils/errors/base/BaseError.js';

export class EnumCheckError extends BaseError {
  constructor(message: string, details?: Details) {
    super(message, details, { type: 'Unprocessable Entity' });
  }
}
