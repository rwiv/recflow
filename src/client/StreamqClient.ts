import {ChannelInfo, LiveInfo} from "./types.js";
import {QueryConfig} from "../common/config.js";

export class StreamqClient {

  constructor(
    private readonly streamqUrl: string,
    private readonly size: number = 1000,
  ) {}

  async requestChzzkByQuery(query: QueryConfig): Promise<LiveInfo[]> {
    const infoMap = new Map<string, LiveInfo>();
    for (const keyword of query.keywords) {
      const res = await this.requestChzzkByKeyword(keyword);
      res.forEach(info => infoMap.set(info.channelId, info));
    }
    for (const tag of query.tags) {
      const res = await this.requestChzzkByTag(tag);
      res.forEach(info => infoMap.set(info.channelId, info));
    }
    return Array.from(infoMap.values());
  }

  async requestChzzkChannel(channelId: string, hasLiveInfo: boolean): Promise<ChannelInfo> {
    let url = `${this.streamqUrl}/chzzk/channel/v1/${channelId}`;
    if (hasLiveInfo) {
      url += "?hasLiveInfo=true";
    }
    const res = await fetch(url, { method: "GET" });
    return await res.json();
  }

  async requestChzzkByTag(tag: string): Promise<LiveInfo[]> {
    let url = `${this.streamqUrl}/chzzk/live/v1/tag?size=${this.size}&tag=${encodeURIComponent(tag)}`;
    const res = await fetch(url, { method: "GET" });
    return await res.json();
  }

  async requestChzzkByKeyword(keyword: string): Promise<LiveInfo[]> {
    let url = `${this.streamqUrl}/chzzk/live/v1/keyword?size=${this.size}&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, { method: "GET" });
    return await res.json();
  }
}