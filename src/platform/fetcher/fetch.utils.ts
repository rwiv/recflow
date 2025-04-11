import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { log } from 'jslog';

export async function checkResponse(res: Response) {
  if (res.status >= 400) {
    let body = '';
    try {
      body = JSON.parse(await res.text()) as string;
    } catch (e) {
      body = 'Http request failure: unknown';
      console.error(e);
    }
    log.debug(`Failed to fetch`, { status: res.status, url: res.url, body });
    throw new HttpRequestError('Failed to fetch', res.status);
  }
}

export async function checkChannelResponse(res: Response, pid: string) {
  if (res.status >= 400) {
    let body = '';
    try {
      body = JSON.parse(await res.text()) as string;
    } catch (e) {
      body = 'Http request failure: unknown';
      console.error(e);
    }
    log.debug(`Failed to fetch channel`, { pid, status: res.status, url: res.url, body });
    throw new HttpRequestError(`Failed to fetch channel`, res.status);
  }
}
