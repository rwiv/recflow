import {
  ChzzkChannelInfoReq,
  ChzzkLiveInfoReq,
} from '../platform/chzzk.req.js';
import { QueryConfig } from '../common/query.js';
import { SoopChannelInfoReq, SoopLiveInfoReq } from '../platform/soop.req.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';

@Injectable()
export class Streamq {
  private readonly streamqUrl: string;
  private readonly size: number = 1000;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.streamqUrl = this.env.streamqUrl;
    this.size = this.env.streamqQsize;
  }

  async getChzzkLive(query: QueryConfig): Promise<ChzzkLiveInfoReq[]> {
    const infoMap = new Map<string, ChzzkLiveInfoReq>();
    for (const tag of query.chzzkTags) {
      const res = await this.getChzzkLiveByTag(tag);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    for (const keyword of query.chzzkKeywords) {
      const res = await this.getChzzkLiveByKeyword(keyword);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    for (const watchPartyNo of query.chzzkWatchPartyNoList) {
      const res = await this.getChzzkLiveByWatchParty(watchPartyNo);
      res.forEach((info) => infoMap.set(info.channelId, info));
    }
    return Array.from(infoMap.values());
  }

  async getChzzkChannel(channelId: string, hasLiveInfo: boolean) {
    let url = `${this.streamqUrl}/chzzk/channel/v1/${channelId}`;
    if (hasLiveInfo) {
      url += '?hasLiveInfo=true';
    }
    const res = await fetch(url, { method: 'GET' });
    await this.checkResponse(res);
    return (await res.json()) as ChzzkChannelInfoReq;
  }

  private async checkResponse(res: Response) {
    if (res.status >= 400) {
      const content = await res.text();
      throw new Error(`Http failure: status=${res.status}, message=${content}`);
    }
  }

  private async getChzzkLiveByTag(tag: string) {
    const url = `${this.streamqUrl}/chzzk/live/v1/tag?size=${this.size}&tag=${encodeURIComponent(tag)}`;
    const res = await fetch(url, { method: 'GET' });
    await this.checkResponse(res);
    return (await res.json()) as ChzzkLiveInfoReq[];
  }

  private async getChzzkLiveByKeyword(keyword: string) {
    const url = `${this.streamqUrl}/chzzk/live/v1/keyword?size=${this.size}&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, { method: 'GET' });
    await this.checkResponse(res);
    return (await res.json()) as ChzzkLiveInfoReq[];
  }

  private async getChzzkLiveByWatchParty(watchPartyNo: number) {
    const url = `${this.streamqUrl}/chzzk/live/v1/watchparty?size=${this.size}&watchPartyNo=${watchPartyNo}`;
    const res = await fetch(url, { method: 'GET' });
    await this.checkResponse(res);
    return (await res.json()) as ChzzkLiveInfoReq[];
  }

  async getSoopLive(query: QueryConfig) {
    const infoMap = new Map<string, SoopLiveInfoReq>();
    for (const cateNo of query.soopCateNoList) {
      const res = await this.getSoopLiveByCategory(cateNo);
      res.forEach((info) => infoMap.set(info.userId, info));
    }
    return Array.from(infoMap.values());
  }

  async getSoopChannel(userId: string, hasLiveInfo: boolean) {
    let url = `${this.streamqUrl}/soop/channel/v1/${userId}`;
    if (hasLiveInfo) {
      url += '?hasLiveInfo=true';
    }
    try {
      const res = await fetch(url, { method: 'GET' });
      await this.checkResponse(res);
      return (await res.json()) as SoopChannelInfoReq | null;
    } catch (e) {
      return null;
    }
  }

  private async getSoopLiveByCategory(cateNo: string) {
    const url = `${this.streamqUrl}/soop/live/v1/category?size=${this.size}&cateNo=${encodeURIComponent(cateNo)}`;
    const res = await fetch(url, { method: 'GET' });
    await this.checkResponse(res);
    return (await res.json()) as SoopLiveInfoReq[];
  }
}
