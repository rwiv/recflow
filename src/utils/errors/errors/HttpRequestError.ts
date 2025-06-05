import { HttpError } from '../base/HttpError.js';
import { Details } from '../base/BaseError.js';

export class HttpRequestError extends HttpError {
  constructor(message: string, status: number, details?: Details) {
    super(message, status, details);
  }
}
