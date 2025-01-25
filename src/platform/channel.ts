import { PlatformChannelInfo, PlatformType } from './types.js';
import { ChzzkChannelInfo } from './chzzk.js';
import { SoopChannelInfo } from './soop.js';

interface ChannelInfo {
  type: PlatformType;
  id: string;
  name: string;
  followerCount: number;
  openLive: boolean;
  content: PlatformChannelInfo;
}

export function channelFromChzzk(info: ChzzkChannelInfo): ChannelInfo {
  return {
    type: 'chzzk',
    id: info.channelId,
    name: info.channelName,
    followerCount: info.followerCount,
    openLive: info.openLive,
    content: info,
  };
}

export function channelFromSoop(info: SoopChannelInfo): ChannelInfo {
  return {
    type: 'soop',
    id: info.userId,
    name: info.userNick,
    followerCount: info.fanCnt,
    openLive: info.openLive,
    content: info,
  };
}
