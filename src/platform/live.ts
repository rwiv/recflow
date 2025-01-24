import { PlatformLiveInfo, PlatformType } from './types.js';
import { ChzzkLiveInfo } from './chzzk.js';
import { SoopLiveInfo } from './soop.js';

export interface LiveInfoObj {
  type: PlatformType;
  channelId: string;
  channelName: string;
  liveId: number;
  liveTitle: string;
  viewCnt: number;
  adult: boolean;
  content: PlatformLiveInfo;
  assignedWebhookName?: string;
}

export class LiveInfo {
  public assignedWebhookName: string | undefined = undefined;

  constructor(
    public readonly type: PlatformType,
    public readonly channelId: string,
    public readonly channelName: string,
    public readonly liveId: number,
    public readonly liveTitle: string,
    public readonly viewCnt: number,
    public readonly adult: boolean,
    public readonly content: PlatformLiveInfo,
  ) {}

  static fromObject(obj: LiveInfoObj): LiveInfo {
    let liveInfo: LiveInfo | null = null;
    if (obj.type === 'chzzk') {
      liveInfo = LiveInfo.fromChzzk(obj.content as ChzzkLiveInfo);
    } else if (obj.type === 'soop') {
      liveInfo = LiveInfo.fromSoop(obj.content as SoopLiveInfo);
    }
    if (!liveInfo) throw Error('Unknown type');

    liveInfo.assignedWebhookName = obj.assignedWebhookName;
    return liveInfo;
  }

  static fromChzzk(info: ChzzkLiveInfo) {
    return new LiveInfo(
      'chzzk',
      info.channelId,
      info.channelName,
      info.liveId,
      info.liveTitle,
      info.concurrentUserCount,
      info.adult,
      info,
    );
  }

  static fromSoop(info: SoopLiveInfo) {
    const viewCnt = parseInt(info.totalViewCnt);
    if (isNaN(viewCnt)) {
      throw new Error('Invalid view count');
    }
    const liveId = parseInt(info.broadNo);
    if (isNaN(liveId)) {
      throw new Error('Invalid live id');
    }
    return new LiveInfo(
      'soop',
      info.userId,
      info.userNick,
      liveId,
      info.broadTitle,
      viewCnt,
      info.adult,
      info,
    );
  }
}
