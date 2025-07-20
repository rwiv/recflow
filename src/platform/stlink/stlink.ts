import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { PlatformName } from '../spec/storage/platform.enum.schema.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { z } from 'zod';
import { headers, nonempty, queryParams } from '../../common/data/common.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { delay } from '../../utils/time.js';
import { LiveDto, LiveStreamDto } from '../../live/spec/live.dto.schema.js';
import { liveAttr } from '../../common/attr/attr.live.js';

export const stlinkStreamInfo = z.object({
  openLive: z.boolean(),
  best: z
    .object({
      type: nonempty,
      name: nonempty,
      mediaPlaylistUrl: nonempty,
      params: queryParams.optional(),
    })
    .optional(),
  headers: headers.optional(),
});
export type StlinkStreamInfo = z.infer<typeof stlinkStreamInfo>;

export const proxyType = z.enum(['domestic', 'overseas']);
export type ProxyType = z.infer<typeof proxyType>;

const RETRY_LIMIT = 2;
const RETRY_DELAY_MS = 100;

@Injectable()
export class Stlink {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async fetchStreamInfo(platform: PlatformName, uid: string, withAuth: boolean): Promise<StlinkStreamInfo> {
    if (platform === 'chzzk') {
      return await this._fetchStreamInfo(platform, uid, withAuth, 'domestic');
    } else if (platform === 'soop') {
      const res = await this._fetchStreamInfo(platform, uid, withAuth, 'overseas');
      if (res.openLive) {
        return res;
      } else {
        return await this._fetchStreamInfo(platform, uid, withAuth, 'domestic');
      }
    } else {
      throw new ValidationError(`Unsupported platform: ${platform}`);
    }
  }

  private async _fetchStreamInfo(
    platform: PlatformName,
    uid: string,
    withAuth: boolean,
    proxy: ProxyType | null,
  ): Promise<StlinkStreamInfo> {
    const params = new URLSearchParams({ fields: 'best,headers' });
    if (withAuth) {
      params.set('withAuth', 'true');
    }
    let endpoint = this.env.stlink.endpoint;
    if (proxy) {
      if (this.env.stlink.useProxy) {
        params.set('proxy', proxy);
      } else {
        if (proxy === 'domestic') {
          endpoint = this.env.stlink.endpointDomestic;
        } else if (proxy === 'overseas') {
          endpoint = this.env.stlink.endpointOverseas;
        }
      }
    }
    const url = `${endpoint}/api/streams/${platform}/${uid}?${params.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(this.env.stlink.httpTimeoutMs),
    });
    if (res.status >= 400) {
      throw new HttpRequestError(`Failed to fetch stream info from stlink`, res.status);
    }
    return stlinkStreamInfo.parse(await res.json());
  }

  async fetchM3u8ByLive(live: LiveDto): Promise<string | null> {
    if (!live.stream) {
      throw new ValidationError('StreamInfo not found', { attr: liveAttr(live) });
    }
    return this.fetchM3u8(live.stream);
  }

  async fetchM3u8(stream: LiveStreamDto): Promise<string | null> {
    for (let retryCnt = 0; retryCnt <= RETRY_LIMIT; retryCnt++) {
      try {
        const res = await fetch(stream.url, {
          headers: stream.headers,
          signal: AbortSignal.timeout(this.env.httpTimeout),
        });
        if (res.status >= 400) {
          throw new HttpRequestError(`Failed to fetch m3u8 from stlink`, res.status);
        }
        return await res.text();
      } catch (e) {
        if (retryCnt === RETRY_LIMIT) {
          return null;
        }
        await delay(RETRY_DELAY_MS);
      }
    }
    return null;
  }
}
