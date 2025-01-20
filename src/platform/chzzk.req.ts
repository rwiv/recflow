export interface ChzzkLiveInfoReq {
  channelId: string;
  channelName: string;
  channelImageUrl: string;
  liveId: number;
  liveTitle: string;
  liveImageUrl: string;
  concurrentUserCount: number;
  accumulateCount: number;
  openDate: string;
  adult: boolean;
  tags: string[];
  categoryType?: string | null;
  liveCategory?: string | null;
  liveCategoryValue: string;
}

export interface ChzzkChannelInfoReq {
  channelId: string;
  channelName: string;
  channelImageUrl: string;

  channelDescription: string;
  followerCount: number;
  openLive: boolean;

  liveInfo: ChzzkLiveInfoReq | null;
}
