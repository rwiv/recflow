import { PlatformChannelInfo, PlatformType } from '../types.js';
import { ChzzkChannelInfo } from '../raw/chzzk.js';
import { SoopChannelInfo } from '../raw/soop.js';
import { liveFromChzzk, liveFromSoop, LiveInfo } from './live.js';

export interface ChannelInfo {
  ptype: PlatformType;
  id: string;
  name: string;
  followerCount: number;
  openLive: boolean;
  content: PlatformChannelInfo;
  liveInfo: LiveInfo | null;
}

export function channelFromChzzk(info: ChzzkChannelInfo): ChannelInfo {
  let liveInfo = null;
  if (info.liveInfo) {
    liveInfo = liveFromChzzk(info.liveInfo);
  }
  return {
    ptype: 'chzzk',
    id: info.channelId,
    name: info.channelName,
    followerCount: info.followerCount,
    openLive: info.openLive,
    content: info,
    liveInfo,
  };
}

export function channelFromSoop(info: SoopChannelInfo): ChannelInfo {
  let liveInfo = null;
  if (info.liveInfo) {
    liveInfo = liveFromSoop(info.liveInfo);
  }
  return {
    ptype: 'soop',
    id: info.userId,
    name: info.userNick,
    followerCount: info.fanCnt,
    openLive: info.openLive,
    content: info,
    liveInfo,
  };
}
