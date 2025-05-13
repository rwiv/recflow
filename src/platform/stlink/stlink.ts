import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { PlatformName } from '../spec/storage/platform.enum.schema.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { z } from 'zod';
import { nonempty } from '../../common/data/common.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { log } from 'jslog';
import { delay } from '../../utils/time.js';
import { LiveDto } from '../../live/spec/live.dto.schema.js';

export const streamInfo = z.object({
  openLive: z.boolean(),
  best: z
    .object({
      type: nonempty,
      name: nonempty,
      mediaPlaylistUrl: nonempty,
    })
    .optional(),
  headers: z.record(z.string()).optional(),
});
export type StreamInfo = z.infer<typeof streamInfo>;

const RETRY_LIMIT = 2;
const RETRY_DELAY_MS = 100;
const STLINK_HTTP_TIMEOUT_MS = 10000;

@Injectable()
export class Stlink {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async fetchStreamInfo(platform: PlatformName, uid: string, withCred: boolean): Promise<StreamInfo> {
    const params = new URLSearchParams({ fields: 'best,headers' });
    if (withCred) {
      params.set('useCredentials', 'true');
    }
    const url = `${this.env.stlink.endpoint}/api/streams/${platform}/${uid}?${params.toString()}`;
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(STLINK_HTTP_TIMEOUT_MS) });
    if (res.status >= 400) {
      throw new HttpRequestError(`Failed to fetch stream info from stlink`, res.status);
    }
    return streamInfo.parse(await res.json());
  }

  async fetchM3u8ByLive(live: LiveDto): Promise<string | null> {
    const streamUrl = live.streamUrl;
    if (!streamUrl) {
      throw new ValidationError('Stream URL not found');
    }
    const headers = live.headers;
    if (!headers) {
      throw new ValidationError('Headers not found');
    }
    return this.fetchM3u8(streamUrl, headers);
  }

  async fetchM3u8(streamUrl: string, headers: Record<string, string>): Promise<string | null> {
    for (let retryCnt = 0; retryCnt <= RETRY_LIMIT; retryCnt++) {
      try {
        const res = await fetch(streamUrl, {
          headers: headers,
          signal: AbortSignal.timeout(this.env.httpTimeout),
        });
        if (res.status >= 400) {
          throw new HttpRequestError(`Failed to fetch m3u8 from stlink`, res.status);
        }
        return await res.text();
      } catch (e) {
        if (retryCnt === RETRY_LIMIT) {
          log.error('Retry Limit Exceeded: Failed to request m3u8', { retryCnt, streamUrl });
          return null;
        }
        log.debug('Retrying m3u8 request', { retryCnt, streamUrl });
        await delay(RETRY_DELAY_MS);
      }
    }
    return null;
  }
}
