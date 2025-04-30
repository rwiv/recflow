import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { PlatformName } from '../spec/storage/platform.enum.schema.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { z } from 'zod';
import { nonempty } from '../../common/data/common.schema.js';

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

@Injectable()
export class Stlink {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async fetchStreamInfo(platform: PlatformName, uid: string, withCred: boolean): Promise<StreamInfo> {
    const params = new URLSearchParams({ fields: 'best,headers' });
    if (withCred) {
      params.set('useCredentials', 'true');
    }
    const url = `${this.env.stlink.endpoint}/api/streams/${platform}/${uid}?${params.toString()}`;
    const res = await fetch(url);
    if (res.status >= 400) {
      throw new HttpRequestError(`Failed to fetch stream info from stlink`, res.status);
    }
    return streamInfo.parse(await res.json());
  }
}
