import { HttpRequestError } from './errors/errors/HttpRequestError.js';

export async function checkResponse(res: Response, attr?: Record<string, any>) {
  if (res.status >= 400) {
    const body = await res.text();
    const newAttr = { ...attr, body };
    throw new HttpRequestError(`Failed to request`, res.status, { attr: newAttr });
  }
}
