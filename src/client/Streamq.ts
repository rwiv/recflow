import {ChzzkChannelInfo, ChzzkLiveInfo} from "./types_chzzk.js";
import {QueryConfig} from "../common/config.js";
import {SoopChannelInfo, SoopLiveInfo} from "./types_soop.js";

export class Streamq {

  constructor(
    private readonly streamqUrl: string,
    private readonly size: number = 1000,
  ) {}

  async getChzzkLive(query: QueryConfig): Promise<ChzzkLiveInfo[]> {
    const infoMap = new Map<string, ChzzkLiveInfo>();
    for (const keyword of query.keywords) {
      const res = await this.getChzzkLiveByKeyword(keyword);
      res.forEach(info => infoMap.set(info.channelId, info));
    }
    for (const tag of query.tags) {
      const res = await this.getChzzkLiveByTag(tag);
      res.forEach(info => infoMap.set(info.channelId, info));
    }
    return Array.from(infoMap.values());
  }

  async getChzzkChannel(channelId: string, hasLiveInfo: boolean): Promise<ChzzkChannelInfo> {
    let url = `${this.streamqUrl}/chzzk/channel/v1/${channelId}`;
    if (hasLiveInfo) {
      url += "?hasLiveInfo=true";
    }
    const res = await fetch(url, { method: "GET" });
    return await res.json();
  }

  private async getChzzkLiveByTag(tag: string): Promise<ChzzkLiveInfo[]> {
    let url = `${this.streamqUrl}/chzzk/live/v1/tag?size=${this.size}&tag=${encodeURIComponent(tag)}`;
    const res = await fetch(url, { method: "GET" });
    return await res.json();
  }

  private async getChzzkLiveByKeyword(keyword: string): Promise<ChzzkLiveInfo[]> {
    let url = `${this.streamqUrl}/chzzk/live/v1/keyword?size=${this.size}&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, { method: "GET" });
    return await res.json();
  }

  async getSoopLive(query: QueryConfig): Promise<SoopLiveInfo[]> {
    const infoMap = new Map<string, SoopLiveInfo>();
    for (const cateNo of query.soopCateNoList) {
      const res = await this.getSoopLiveByCategory(cateNo);
      res.forEach(info => infoMap.set(info.userId, info));
    }
    return Array.from(infoMap.values());
  }

  async getSoopChannel(userId: string, hasLiveInfo: boolean): Promise<SoopChannelInfo | null> {
    let url = `${this.streamqUrl}/soop/channel/v1/${userId}`;
    if (hasLiveInfo) {
      url += "?hasLiveInfo=true";
    }
    try {
      const res = await fetch(url, { method: "GET" });
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  private async getSoopLiveByCategory(cateNo: string): Promise<SoopLiveInfo[]> {
    let url = `${this.streamqUrl}/soop/live/v1/category?size=${this.size}&cateNo=${encodeURIComponent(cateNo)}`;
    const res = await fetch(url, { method: "GET" });
    return await res.json();
  }
}
