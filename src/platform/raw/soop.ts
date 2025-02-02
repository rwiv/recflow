export interface SoopLiveInfo {
  userId: string;
  userNick: string;
  stationName: string;
  broadStart: string;

  broadNo: string;
  broadTitle: string;
  broadThumb: string;
  broadBps: string;
  broadResolution: string;
  broadCateNo: string;
  totalViewCnt: string;
  categoryTags: string[];
  hashTags: string[];
  adult: boolean;
  locked: boolean;
}

export interface SoopChannelInfo {
  userId: string;
  userNick: string;
  profileImageUrl: string;
  profileText: string;
  stationName: string;

  fanCnt: number;
  subscriptionCnt: number;
  isBestBj: boolean;
  isPartnerBj: boolean;

  broadStart: string;
  openLive: boolean;

  liveInfo: SoopLiveInfo | null;
}
