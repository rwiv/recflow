import { ChzzkChannelInfoReq, ChzzkLiveInfoReq } from './chzzk.req.js';

export class ChzzkLiveInfo {
  constructor(
    public channelId: string,
    public channelName: string,
    public channelImageUrl: string,
    public liveId: number,
    public liveTitle: string,
    public liveImageUrl: string,
    public concurrentUserCount: number,
    public accumulateCount: number,
    public openDate: string,
    public adult: boolean,
    public tags: string[],
    public liveCategoryValue: string,
    public categoryType?: string | null,
    public liveCategory?: string | null,
  ) {}

  static fromReq(info: ChzzkLiveInfoReq): ChzzkLiveInfo {
    return new ChzzkLiveInfo(
      info.channelId,
      info.channelName,
      info.channelImageUrl,
      info.liveId,
      info.liveTitle,
      info.liveImageUrl,
      info.concurrentUserCount,
      info.accumulateCount,
      info.openDate,
      info.adult,
      info.tags,
      info.liveCategoryValue,
      info.categoryType,
      info.liveCategory,
    );
  }
}

export class ChzzkChannelInfo {
  constructor(
    public channelId: string,
    public channelName: string,
    public channelImageUrl: string,
    public channelDescription: string,
    public followerCount: number,
    public openLive: boolean,
    public liveInfo: ChzzkLiveInfo | null,
  ) {}

  static fromReq(info: ChzzkChannelInfoReq): ChzzkChannelInfo {
    return new ChzzkChannelInfo(
      info.channelId,
      info.channelName,
      info.channelImageUrl,
      info.channelDescription,
      info.followerCount,
      info.openLive,
      info.liveInfo ? ChzzkLiveInfo.fromReq(info.liveInfo) : null,
    );
  }
}
