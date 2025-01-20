import { SoopChannelInfoReq, SoopLiveInfoReq } from './soop.req.js';

export class SoopLiveInfo {
  constructor(
    public userId: string,
    public userNick: string,
    public stationName: string,
    public broadStart: string,
    public broadNo: string,
    public broadTitle: string,
    public broadThumb: string,
    public broadBps: string,
    public broadResolution: string,
    public broadCateNo: string,
    public totalViewCnt: number,
    public categoryTags: string[],
    public hashTags: string[],
    public adult: boolean,
    public locked: boolean,
  ) {}

  static fromReq(info: SoopLiveInfoReq): SoopLiveInfo {
    const viewCnt = parseInt(info.totalViewCnt);
    if (isNaN(viewCnt)) {
      throw new Error('Invalid view count');
    }
    return new SoopLiveInfo(
      info.userId,
      info.userNick,
      info.stationName,
      info.broadStart,

      info.broadNo,
      info.broadTitle,
      info.broadThumb,
      info.broadBps,
      info.broadResolution,
      info.broadCateNo,
      viewCnt,
      info.categoryTags,
      info.hashTags,
      info.adult,
      info.locked,
    );
  }
}

export class SoopChannelInfo {
  constructor(
    public userId: string,
    public userNick: string,
    public stationName: string,
    public broadStart: string,

    public fanCnt: number,
    public openLive: boolean,

    public liveInfo: SoopLiveInfo | null,
  ) {}

  static fromReq(info: SoopChannelInfoReq): SoopChannelInfo {
    return new SoopChannelInfo(
      info.userId,
      info.userNick,
      info.stationName,
      info.broadStart,
      info.fanCnt,
      info.openLive,
      info.liveInfo ? SoopLiveInfo.fromReq(info.liveInfo) : null,
    );
  }
}
