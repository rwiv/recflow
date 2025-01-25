import { PlatformLiveInfo, PlatformType } from './types.js';
import { ChzzkLiveInfo } from './chzzk.js';
import { SoopLiveInfo } from './soop.js';

export interface LiveInfo {
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

export function liveFromChzzk(info: ChzzkLiveInfo): LiveInfo {
  return {
    type: 'chzzk',
    channelId: info.channelId,
    channelName: info.channelName,
    liveId: info.liveId,
    liveTitle: info.liveTitle,
    viewCnt: info.concurrentUserCount,
    adult: info.adult,
    content: info,
  };
}

export function liveFromSoop(info: SoopLiveInfo): LiveInfo {
  const viewCnt = parseInt(info.totalViewCnt);
  if (isNaN(viewCnt)) {
    throw new Error('Invalid view count');
  }
  const liveId = parseInt(info.broadNo);
  if (isNaN(liveId)) {
    throw new Error('Invalid live id');
  }
  return {
    type: 'soop',
    channelId: info.userId,
    channelName: info.userNick,
    liveId: liveId,
    liveTitle: info.broadTitle,
    viewCnt: viewCnt,
    adult: info.adult,
    content: info,
  };
}
