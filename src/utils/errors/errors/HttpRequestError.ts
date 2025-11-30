import { Details } from '@/utils/errors/base/BaseError.js';
import { HttpError } from '@/utils/errors/base/HttpError.js';

export class HttpRequestError extends HttpError {
  constructor(message: string, status: number, details?: Details) {
    super(message, status, details);
  }
}
