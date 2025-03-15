import { channelFromChzzk, ChannelInfo } from '../spec/wapper/channel.js';
import { liveFromChzzk, LiveInfo } from '../spec/wapper/live.js';
import { chzzkChannelInfo, ChzzkLiveInfo, chzzkLiveInfoResponse } from '../spec/raw/chzzk.js';
import { Env } from '../../common/config/env.js';
import { checkChannelResponse, checkResponse } from './fetch.utils.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { ChzzkCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { nnint } from '../../common/data/common.schema.js';

@Injectable()
export class ChzzkFetcher {
  private readonly baseUrl: string;
  private readonly size: number;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.baseUrl = `${this.env.streamq.url}/api/chzzk`;
    this.size = this.env.streamq.qsize;
  }

  async fetchLives(cr: ChzzkCriterionDto): Promise<LiveInfo[]> {
    const infoMap = new Map<string, ChzzkLiveInfo>();
    for (const tag of cr.positiveTags) {
      const res = await this.fetchLivesByTag(tag);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    for (const keyword of cr.positiveKeywords) {
      const res = await this.fetchLivesByKeyword(keyword);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    for (const watchPartyNo of cr.positiveWps) {
      const res = await this.fetchLivesByWatchParty(nnint.parse(watchPartyNo));
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    return Array.from(infoMap.values()).map((it) => liveFromChzzk(it));
  }

  async fetchChannel(pid: string, hasLiveInfo: boolean, checkStream: boolean): Promise<ChannelInfo> {
    let url = `${this.baseUrl}/channels/v1/${pid}`;
    if (hasLiveInfo) {
      url += '?hasLiveInfo=true';
    }
    if (checkStream) {
      url += hasLiveInfo ? '&checkStream=true' : '?checkStream=true';
    }
    const res = await fetch(url, { method: 'GET' });
    await checkChannelResponse(res, pid);
    return channelFromChzzk(chzzkChannelInfo.parse(await res.json()));
  }

  private async fetchLivesByTag(tag: string) {
    const url = `${this.baseUrl}/lives/v1/tag?${this.getQs('tag', tag)}`;
    return this.requestLives(url);
  }

  private async fetchLivesByKeyword(keyword: string) {
    const url = `${this.baseUrl}/lives/v1/keyword?${this.getQs('keyword', keyword)}`;
    return this.requestLives(url);
  }

  private async fetchLivesByWatchParty(watchPartyNo: number) {
    const url = `${this.baseUrl}/lives/v1/watchparty?${this.getQs('watchPartyNo', watchPartyNo.toString())}`;
    return this.requestLives(url);
  }

  private getQs(key: string, value: string) {
    return `${key}=${encodeURIComponent(value)}&size=${this.size}`;
  }

  private async requestLives(url: string) {
    const res = await fetch(url, { method: 'GET' });
    await checkResponse(res);
    return chzzkLiveInfoResponse.parse(await res.json());
  }
}
