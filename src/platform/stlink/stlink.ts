import { Inject, Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { z } from 'zod';

import { CheckedError } from '@/utils/errors/errors/CheckedError.js';
import { HttpRequestError } from '@/utils/errors/errors/HttpRequestError.js';
import { ValidationError } from '@/utils/errors/errors/ValidationError.js';
import { delay } from '@/utils/time.js';

import { liveInfoAttr } from '@/common/attr/attr.live.js';
import { ENV } from '@/common/config/config.module.js';
import { Env } from '@/common/config/env.js';
import { RetryOptions, headers, nonempty, queryParams } from '@/common/data/common.schema.js';

import { PlatformName } from '@/platform/spec/storage/platform.enum.schema.js';
import { LiveInfo } from '@/platform/spec/wapper/live.js';

import { StreamInfo, streamInfo } from '@/live/spec/live.dto.schema.js';

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

export const defaultRetryOpts: RetryOptions = { limit: 2, delayMs: 500, backoff: false };
export const longRetryOpts: RetryOptions = { limit: 9, delayMs: 500, backoff: true };

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

  toStreamInfo(res: StlinkStreamInfo, liveInfo: LiveInfo): StreamInfo | null | CheckedError {
    if (!res.openLive) {
      log.debug('This live is inaccessible', liveInfoAttr(liveInfo));
      return new CheckedError('This live is inaccessible');
    }
    if (!res.best || !res.headers) {
      log.error('Stream info is not available', liveInfoAttr(liveInfo));
      return null;
    }

    const streamUrl = res?.best?.mediaPlaylistUrl;
    const streamHeaders = res?.headers;
    if (!streamUrl || !streamHeaders) {
      throw new ValidationError('Stream info is not available');
    }

    const result: StreamInfo = { url: streamUrl, headers: streamHeaders, params: res?.best?.params ?? null };
    return streamInfo.parse(result);
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

  async fetchM3u8(stream: StreamInfo, opts: RetryOptions = defaultRetryOpts): Promise<string | null> {
    for (let retryCnt = 0; retryCnt <= opts.limit; retryCnt++) {
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
        if (retryCnt === opts.limit) {
          return null;
        }
        await delay(opts.backoff ? opts.delayMs * 2 ** retryCnt : opts.delayMs);
      }
    }
    return null;
  }
}
