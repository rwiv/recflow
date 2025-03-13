import { channelFromSoop, ChannelInfo } from '../spec/wapper/channel.js';
import { liveFromSoop, LiveInfo } from '../spec/wapper/live.js';
import { Env } from '../../common/config/env.js';
import { SoopChannelInfo, SoopLiveInfo } from '../spec/raw/soop.js';
import { checkChannelResponse, checkResponse } from './fetch.utils.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { SoopCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';

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
    for (const cateNo of cr.positiveCates) {
      let withCred = false;
      if (cr.enforceCreds) {
        withCred = true;
      }
      const res = await this.getSoopLiveByCategory(cateNo, withCred);
      res.forEach((info) => infoMap.set(info.userId, info));
    }
    return Array.from(infoMap.values()).map((info) => liveFromSoop(info));
  }

  async fetchChannel(pid: string, hasLiveInfo: boolean): Promise<ChannelInfo> {
    let url = `${this.baseUrl}/channels/v1/${pid}`;
    if (hasLiveInfo) {
      url += '?hasLiveInfo=true';
    }
    const res = await fetch(url, { method: 'GET' });
    await checkChannelResponse(res, pid);
    return channelFromSoop((await res.json()) as SoopChannelInfo);
  }

  private async getSoopLiveByCategory(cateNo: string, withCred: boolean = false) {
    const qs = `cateNo=${encodeURIComponent(cateNo)}&size=${this.size}&withCred=${withCred}`;
    const url = `${this.baseUrl}/lives/v1/category?${qs}`;
    const res = await fetch(url, { method: 'GET' });
    await checkResponse(res);
    return (await res.json()) as SoopLiveInfo[];
  }
}
