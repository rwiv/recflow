export interface LiveInfo {
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

export interface ChannelInfo {
  channelId: string;
  channelName: string;
  channelImageUrl: string;

  channelDescription: string;
  followerCount: number;
  openLive: boolean;

  liveInfo: LiveInfo | null;
}

export interface Cookie {
  domain: string;
  expirationDate: number;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: string;
  secure: boolean;
  value: string;
}
