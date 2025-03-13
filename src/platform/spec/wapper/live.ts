import { ChzzkLiveInfo } from '../raw/chzzk.js';
import { SoopLiveInfo } from '../raw/soop.js';
import { PlatformName } from '../storage/platform.enum.schema.js';

export type PlatformLiveInfo = ChzzkLiveInfo | SoopLiveInfo;

export interface LiveInfo {
  type: PlatformName;
  pid: string;
  channelName: string;
  liveId: number;
  liveTitle: string;
  viewCnt: number;
  isAdult: boolean;
  openDate: string;
  content: PlatformLiveInfo;
}

export function liveFromChzzk(info: ChzzkLiveInfo): LiveInfo {
  return {
    type: 'chzzk',
    pid: info.channelId,
    channelName: info.channelName,
    liveId: info.liveId,
    liveTitle: info.liveTitle,
    viewCnt: info.concurrentUserCount,
    isAdult: info.adult,
    openDate: new Date(info.openDate).toISOString(),
    content: info,
  };
}

export function liveFromSoop(info: SoopLiveInfo): LiveInfo {
  return {
    type: 'soop',
    pid: info.userId,
    channelName: info.userNick,
    liveId: info.broadNo,
    liveTitle: info.broadTitle,
    viewCnt: info.viewCnt,
    isAdult: info.adult,
    openDate: new Date(info.broadStart).toISOString(),
    content: info,
  };
}
