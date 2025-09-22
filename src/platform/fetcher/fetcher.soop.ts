import { channelFromSoop, ChannelInfo } from '../spec/wapper/channel.js';
import { liveFromSoop, LiveInfo } from '../spec/wapper/live.js';
import { Env } from '../../common/config/env.js';
import { soopChannelInfo, SoopLiveInfo, soopLiveInfoResponse } from '../spec/raw/soop.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { SoopCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { checkResponse } from '../../utils/http.js';

@Injectable()
export class SoopFetcher {
  private readonly baseUrl: string;
  private readonly size: number;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.baseUrl = `${this.env.streamq.url}/api/soop`;
    this.size = this.env.streamq.qsize;
  }

  async fetchLives(cr: SoopCriterionDto): Promise<LiveInfo[]> {
    const infoMap = new Map<string, SoopLiveInfo>();
    let withCred = false;
    if (cr.enforceCreds) {
      withCred = true;
    }
    for (const tag of cr.positiveTags) {
      const res = await this.fetchLivesByTag(tag.value);
      res.forEach((info) => infoMap.set(info.userId, info));
    }
    for (const keyword of cr.positiveKeywords) {
      const res = await this.fetchLivesByKeyword(keyword.value);
      res.forEach((info) => infoMap.set(info.userId, info));
    }
    for (const cateNo of cr.positiveCates) {
      const res = await this.fetchLivesByCategory(cateNo.value, withCred);
      res.forEach((info) => infoMap.set(info.userId, info));
    }
    return Array.from(infoMap.values()).map((info) => liveFromSoop(info));
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
    return channelFromSoop(soopChannelInfo.parse(await res.json()));
  }

  private async fetchLivesByTag(tag: string, withAuth: boolean = false) {
    const qs = this.liveQs('tag', tag, withAuth);
    return this.requestLives(`${this.baseUrl}/lives/v1/tag?${qs}`);
  }

  private async fetchLivesByKeyword(keyword: string, withAuth: boolean = false) {
    const qs = this.liveQs('keyword', keyword, withAuth);
    return this.requestLives(`${this.baseUrl}/lives/v1/keyword?${qs}`);
  }

  private async fetchLivesByCategory(cateNo: string, withAuth: boolean = false) {
    const qs = this.liveQs('cateNo', cateNo, withAuth);
    return this.requestLives(`${this.baseUrl}/lives/v1/category?${qs}`);
  }

  private liveQs(key: string, value: string, withAuth: boolean) {
    const params = new URLSearchParams({ [key]: value, size: this.size.toString() });
    if (withAuth) {
      params.set('withCred', 'true');
    }
    return params.toString();
  }

  private async requestLives(url: string) {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(this.env.httpTimeout) });
    const attr = { status: res.status, url: res.url };
    await checkResponse(res, attr, 'Failed to fetch lives');
    return soopLiveInfoResponse.parse(await res.json());
  }
}
