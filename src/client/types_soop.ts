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
  stationName: string;
  broadStart: string;

  fanCnt: number;
  openLive: boolean;

  liveInfo?: SoopLiveInfo | null;
}
