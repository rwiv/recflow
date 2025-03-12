import { channelFromChzzk, ChannelInfo } from '../spec/wapper/channel.js';
import { liveFromChzzk, LiveInfo } from '../spec/wapper/live.js';
import { ChzzkChannelInfo, ChzzkLiveInfo } from '../spec/raw/chzzk.js';
import { Env } from '../../common/config/env.js';
import { checkChannelResponse, checkResponse } from './fetch.utils.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { ChzzkCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { nnint } from '../../common/data/common.schema.js';

@Injectable()
export class ChzzkFetcher {
  private readonly url: string;
  private readonly size: number;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.url = this.env.streamq.url;
    this.size = this.env.streamq.qsize;
  }

  async fetchLives(cr: ChzzkCriterionDto): Promise<LiveInfo[]> {
    const infoMap = new Map<string, ChzzkLiveInfo>();
    for (const tag of cr.positiveTags) {
      const res = await this.getChzzkLiveByTag(tag);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    for (const keyword of cr.positiveKeywords) {
      const res = await this.getChzzkLiveByKeyword(keyword);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    for (const watchPartyNo of cr.positiveWps) {
      const res = await this.getChzzkLiveByWatchParty(nnint.parse(watchPartyNo));
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    return Array.from(infoMap.values()).map((it) => liveFromChzzk(it));
  }

  async fetchChannel(pid: string, hasLiveInfo: boolean): Promise<ChannelInfo> {
    let url = `${this.url}/chzzk/channel/v1/${pid}`;
    if (hasLiveInfo) {
      url += '?hasLiveInfo=true';
    }
    const res = await fetch(url, { method: 'GET' });
    await checkChannelResponse(res, pid);
    return channelFromChzzk((await res.json()) as ChzzkChannelInfo);
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
