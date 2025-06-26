import { HttpRequestError } from './errors/errors/HttpRequestError.js';
import { HttpError } from './errors/base/HttpError.js';

export async function checkResponse(res: Response, attr?: Record<string, any>, message: string = 'Failed to request') {
  if (res.status >= 400) {
    const body = await res.text();
    const newAttr = { ...attr, body };
    throw new HttpRequestError(message, res.status, { attr: newAttr });
  }
}

export function getHttpRequestError(message: string, err: unknown, attr: Record<string, any>, defaultStatus = 500) {
  if (err instanceof HttpRequestError) {
    err.extendAttr(attr);
    if (message !== err.message) {
      err.updateMessage(`${message} (${err.message})`);
    }
    return err;
  }
  let status = defaultStatus;
  let newAttr: Record<string, any> = { ...attr };
  if (err instanceof HttpError) {
    status = err.status;
    newAttr = { ...err.attr, ...attr, status };
  }
  return new HttpRequestError(message, status, { cause: err, attr: newAttr });
}
