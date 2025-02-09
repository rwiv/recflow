import { PlatformLiveInfo, PlatformType } from '../platform.types.js';
import { ChzzkLiveInfo } from '../raw/chzzk.js';
import { SoopLiveInfo } from '../raw/soop.js';
import { parseInteger } from '../../utils/number.js';

export interface LiveInfo {
  type: PlatformType;
  pid: string;
  channelName: string;
  liveId: number;
  liveTitle: string;
  viewCnt: number;
  adult: boolean;
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
    adult: info.adult,
    openDate: new Date(info.openDate).toISOString(),
    content: info,
  };
}

export function liveFromSoop(info: SoopLiveInfo): LiveInfo {
  return {
    type: 'soop',
    pid: info.userId,
    channelName: info.userNick,
    liveId: parseInteger(info.broadNo),
    liveTitle: info.broadTitle,
    viewCnt: parseInteger(info.totalViewCnt),
    adult: info.adult,
    openDate: new Date(info.broadStart).toISOString(),
    content: info,
  };
}
