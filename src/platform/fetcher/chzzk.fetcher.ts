import { channelFromChzzk, ChannelInfo } from '../wapper/channel.js';
import { liveFromChzzk, LiveInfo } from '../wapper/live.js';
import { ChzzkChannelInfo, ChzzkLiveInfo } from '../raw/chzzk.js';
import { QueryConfig } from '../../common/query.js';
import { Env } from '../../common/env.js';
import { checkResponse } from '../utils/utils.js';
import { IFetcher } from '../types.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV, QUERY } from '../../common/config.module.js';

@Injectable()
export class ChzzkFetcher implements IFetcher {
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
    const infoMap = new Map<string, ChzzkLiveInfo>();
    for (const tag of this.query.chzzkTags) {
      const res = await this.getChzzkLiveByTag(tag);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    for (const keyword of this.query.chzzkKeywords) {
      const res = await this.getChzzkLiveByKeyword(keyword);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    for (const watchPartyNo of this.query.chzzkWatchPartyNoList) {
      const res = await this.getChzzkLiveByWatchParty(watchPartyNo);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    return Array.from(infoMap.values()).map((it) => liveFromChzzk(it));
  }

  async fetchChannel(uid: string, hasLiveInfo: boolean): Promise<ChannelInfo | null> {
    let url = `${this.url}/chzzk/channel/v1/${uid}`;
    if (hasLiveInfo) {
      url += '?hasLiveInfo=true';
    }
    try {
      const res = await fetch(url, { method: 'GET' });
      await checkResponse(res);
      return channelFromChzzk((await res.json()) as ChzzkChannelInfo);
    } catch (e) {
      return null;
    }
  }

  private async getChzzkLiveByTag(tag: string) {
    const url = `${this.url}/chzzk/live/v1/tag?size=${this.size}&tag=${encodeURIComponent(tag)}`;
    const res = await fetch(url, { method: 'GET' });
    await checkResponse(res);
    return (await res.json()) as ChzzkLiveInfo[];
  }

  private async getChzzkLiveByKeyword(keyword: string) {
    const url = `${this.url}/chzzk/live/v1/keyword?size=${this.size}&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, { method: 'GET' });
    await checkResponse(res);
    return (await res.json()) as ChzzkLiveInfo[];
  }

  private async getChzzkLiveByWatchParty(watchPartyNo: number) {
    const url = `${this.url}/chzzk/live/v1/watchparty?size=${this.size}&watchPartyNo=${watchPartyNo}`;
    const res = await fetch(url, { method: 'GET' });
    await checkResponse(res);
    return (await res.json()) as ChzzkLiveInfo[];
  }
}
