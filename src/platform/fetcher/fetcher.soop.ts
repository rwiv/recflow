import { channelFromSoop, ChannelInfo } from '../data/wapper/channel.js';
import { liveFromSoop, LiveInfo } from '../data/wapper/live.js';
import { QueryConfig } from '../../common/config/query.js';
import { Env } from '../../common/config/env.js';
import { SoopChannelInfo, SoopLiveInfo } from '../data/raw/soop.js';
import { checkChannelResponse, checkResponse } from './fetch.utils.js';
import { IFetcher } from '../platform.types.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV, QUERY } from '../../common/config/config.module.js';

@Injectable()
export class SoopFetcher implements IFetcher {
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

  async fetchChannel(pid: string, hasLiveInfo: boolean): Promise<ChannelInfo> {
    let url = `${this.url}/soop/channel/v1/${pid}`;
    if (hasLiveInfo) {
      url += '?hasLiveInfo=true';
    }
    const res = await fetch(url, { method: 'GET' });
    await checkChannelResponse(res, pid);
    return channelFromSoop((await res.json()) as SoopChannelInfo);
  }

  private async getSoopLiveByCategory(cateNo: string) {
    const url = `${this.url}/soop/live/v1/category?size=${this.size}&cateNo=${encodeURIComponent(cateNo)}`;
    const res = await fetch(url, { method: 'GET' });
    await checkResponse(res);
    return (await res.json()) as SoopLiveInfo[];
  }
}
