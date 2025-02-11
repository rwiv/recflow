import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';

export async function checkResponse(res: Response) {
  if (res.status >= 400) {
    let content = '';
    try {
      content = await res.text();
    } catch (e) {
      content = 'Http request failure: unknown';
      console.error(e);
    }
    throw new HttpRequestError(content, res.status);
  }
}

export async function checkChannelResponse(res: Response, pid: string) {
  if (res.status >= 400) {
    let content = '';
    try {
      content = await res.text();
    } catch (e) {
      content = 'Http request failure: unknown';
      console.error(e);
    }
    // TODO: update logic after modify streamq
    if (content === 'channel not found') {
      throw new HttpRequestError(`Channel not found: pid=${pid}`, 404);
    } else {
      throw new HttpRequestError(content, res.status);
    }
  }
}
