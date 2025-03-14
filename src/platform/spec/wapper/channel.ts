import { ChzzkChannelInfo } from '../raw/chzzk.js';
import { SoopChannelInfo } from '../raw/soop.js';
import { liveFromChzzk, liveFromSoop, LiveInfo } from './live.js';
import { PlatformName } from '../storage/platform.enum.schema.js';

export interface ChannelBase {
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platform: PlatformName;
}

export type PlatformChannelInfo = ChzzkChannelInfo | SoopChannelInfo;

export interface ChannelInfo extends ChannelBase {
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
    platform: 'chzzk',
    pid: info.channelId,
    username: info.channelName,
    profileImgUrl: info.channelImageUrl,
    followerCnt: info.followerCount,
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
    platform: 'soop',
    pid: info.userId,
    username: info.userNick,
    profileImgUrl: info.profileImageUrl,
    followerCnt: info.fanCnt,
    openLive: info.openLive,
    content: info,
    liveInfo,
  };
}
