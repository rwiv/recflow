import { BaseError, Details } from '../base/BaseError.js';

export class NotFoundError extends BaseError {
  constructor(message: string, details?: Details) {
    super(message, details, { type: 'Not Found' });
  }

  static from(name: string, queryKeyName: string, queryKey: string, attr?: Record<string, any>) {
    return new NotFoundError(`${name} not found: ${queryKeyName}=${queryKey}`, { attr });
  }
}
