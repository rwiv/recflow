import { HttpError } from '../../utils/errors/base/HttpError.js';

export async function checkResponse(res: Response) {
  if (res.status >= 400) {
    let content = '';
    try {
      content = await res.text();
    } catch (e) {
      content = 'Http failure: unknown';
      console.error(e);
    }
    throw new HttpError(content, res.status);
  }
}
