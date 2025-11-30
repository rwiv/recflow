import { BaseError, Details } from '@/utils/errors/base/BaseError.js';

export class ParsingError extends BaseError {
  constructor(message: string, details?: Details) {
    super(message, details, { type: 'Unprocessable Entity' });
  }
}
