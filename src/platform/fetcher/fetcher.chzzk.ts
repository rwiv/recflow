import { channelFromChzzk, ChannelInfo } from '../spec/wapper/channel.js';
import { liveFromChzzk, LiveInfo } from '../spec/wapper/live.js';
import { chzzkChannelInfo, ChzzkLiveInfo, chzzkLiveInfoResponse } from '../spec/raw/chzzk.js';
import { Env } from '../../common/config/env.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { ChzzkCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { nnint } from '../../common/data/common.schema.js';
import { checkResponse } from '../../utils/http.js';

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

  async fetchChannel(sourceId: string, hasLiveInfo: boolean): Promise<ChannelInfo> {
    let url = `${this.baseUrl}/channels/v1/${sourceId}`;
    const params = new URLSearchParams();
    if (hasLiveInfo) {
      params.set('hasLiveInfo', 'true');
    }
    if (params.toString().length > 0) {
      url += `?${params.toString()}`;
    }
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(this.env.httpTimeout) });
    const attr = { channel_uid: sourceId, status: res.status, url: res.url };
    await checkResponse(res, attr, 'Failed to fetch channel');
    return channelFromChzzk(chzzkChannelInfo.parse(await res.json()));
  }

  private async fetchLivesByTag(tag: string) {
    const url = `${this.baseUrl}/lives/v1/tag?${this.liveQs('tag', tag)}`;
    return this.requestLives(url);
  }

  private async fetchLivesByKeyword(keyword: string) {
    const url = `${this.baseUrl}/lives/v1/keyword?${this.liveQs('keyword', keyword)}`;
    return this.requestLives(url);
  }

  private async fetchLivesByWatchParty(watchPartyNo: number) {
    const url = `${this.baseUrl}/lives/v1/watchparty?${this.liveQs('watchPartyNo', watchPartyNo.toString())}`;
    return this.requestLives(url);
  }

  private liveQs(key: string, value: string) {
    return new URLSearchParams({ [key]: value, size: this.size.toString() }).toString();
  }

  private async requestLives(url: string) {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(this.env.httpTimeout) });
    const attr = { status: res.status, url: res.url };
    await checkResponse(res, attr, 'Failed to fetch lives');
    return chzzkLiveInfoResponse.parse(await res.json());
  }
}
