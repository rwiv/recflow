import { PlatformLiveInfo, PlatformType } from './types.js';
import { ChzzkLiveInfoReq } from './chzzk.req.js';
import { SoopLiveInfoReq } from './soop.req.js';
import { ChzzkLiveInfo } from './chzzk.dto.js';
import { SoopLiveInfo } from './soop.dto.js';

export type LiveInfo = LiveInfoWrapper<PlatformLiveInfo>;

export class LiveInfoWrapper<T> {
  public assignedWebhookName: string | undefined = undefined;

  constructor(
    public readonly type: PlatformType,
    public readonly channelId: string,
    public readonly channelName: string,
    public readonly liveTitle: string,
    public readonly viewCnt: number,
    public readonly adult: boolean,
    public readonly content: T,
  ) {}

  static fromObject(obj: LiveInfo): LiveInfo {
    let liveInfo: LiveInfo = null;
    if (obj.type === 'chzzk') {
      liveInfo = LiveInfoWrapper.fromChzzkReq(obj.content as ChzzkLiveInfoReq);
    } else if (obj.type === 'soop') {
      liveInfo = LiveInfoWrapper.fromSoopReq(obj.content as SoopLiveInfoReq);
    }
    if (!liveInfo) throw Error('Unknown type');

    liveInfo.assignedWebhookName = obj.assignedWebhookName;
    return liveInfo;
  }

  static fromChzzk(info: ChzzkLiveInfo): LiveInfoWrapper<ChzzkLiveInfo> {
    return new LiveInfoWrapper(
      'chzzk',
      info.channelId,
      info.channelName,
      info.liveTitle,
      info.concurrentUserCount,
      info.adult,
      info,
    );
  }

  static fromSoop(info: SoopLiveInfo): LiveInfoWrapper<SoopLiveInfo> {
    const viewCnt = parseInt(info.totalViewCnt);
    if (isNaN(viewCnt)) {
      throw new Error('Invalid view count');
    }
    return new LiveInfoWrapper(
      'soop',
      info.userId,
      info.userNick,
      info.broadTitle,
      viewCnt,
      info.adult,
      info,
    );
  }

  static fromChzzkReq(info: ChzzkLiveInfoReq): LiveInfoWrapper<ChzzkLiveInfo> {
    return LiveInfoWrapper.fromChzzk(ChzzkLiveInfo.fromReq(info));
  }

  static fromSoopReq(info: SoopLiveInfoReq): LiveInfoWrapper<SoopLiveInfo> {
    return LiveInfoWrapper.fromSoop(SoopLiveInfo.fromReq(info));
  }
}
