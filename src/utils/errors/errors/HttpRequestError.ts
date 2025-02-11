import { HttpError } from '../base/HttpError.js';

export class HttpRequestError extends HttpError {
  constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, status, options);
  }
}
