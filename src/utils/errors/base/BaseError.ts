import { ErrorCode } from '../types/types.js';

export class BaseError extends Error {
  readonly code: ErrorCode | undefined;

  constructor(message: string, options?: ErrorOptions, code?: ErrorCode) {
    super(message, options);
    if (code) {
      this.code = code;
    }
  }
}
