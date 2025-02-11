import { ErrorType } from '../types/types.js';

export class BaseError extends Error {
  readonly type: ErrorType | undefined;
  readonly code: string | undefined;

  constructor(message: string, options?: ErrorOptions, type?: ErrorType, code?: string) {
    super(message, options);
    this.name = this.constructor.name;
    if (type) {
      this.type = type;
    }
    if (code) {
      this.code = code;
    }
  }
}
