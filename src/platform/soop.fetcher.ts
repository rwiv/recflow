import { PlatformFetcher } from './types.js';
import { channelFromSoop, ChannelInfo } from './channel.js';
import { liveFromSoop, LiveInfo } from './live.js';
import { QueryConfig } from '../common/query.js';
import { Inject } from '@nestjs/common';
import { ENV, QUERY } from '../common/common.module.js';
import { Env } from '../common/env.js';
import { SoopChannelInfo, SoopLiveInfo } from './soop.js';
import { checkResponse } from './utils.js';

export class SoopFetcher implements PlatformFetcher {
  private readonly url: string;
  private readonly size: number;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
  ) {
    this.url = this.env.streamqUrl;
    this.size = this.env.streamqQsize;
  }

  async fetchLives(): Promise<LiveInfo[]> {
    const infoMap = new Map<string, SoopLiveInfo>();
    for (const cateNo of this.query.soopCateNoList) {
      const res = await this.getSoopLiveByCategory(cateNo);
      res.forEach((info) => infoMap.set(info.userId, info));
    }
    return Array.from(infoMap.values()).map((info) => liveFromSoop(info));
  }

  async fetchChannel(uid: string, hasLiveInfo: boolean): Promise<ChannelInfo | null> {
    let url = `${this.url}/soop/channel/v1/${uid}`;
    if (hasLiveInfo) {
      url += '?hasLiveInfo=true';
    }
    try {
      const res = await fetch(url, { method: 'GET' });
      await checkResponse(res);
      return channelFromSoop((await res.json()) as SoopChannelInfo);
    } catch (e) {
      return null;
    }
  }

  private async getSoopLiveByCategory(cateNo: string) {
    const url = `${this.url}/soop/live/v1/category?size=${this.size}&cateNo=${encodeURIComponent(cateNo)}`;
    const res = await fetch(url, { method: 'GET' });
    await checkResponse(res);
    return (await res.json()) as SoopLiveInfo[];
  }
}
