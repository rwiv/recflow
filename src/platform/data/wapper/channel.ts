import { PlatformChannelInfo } from '../../platform.types.js';
import { ChzzkChannelInfo } from '../raw/chzzk.js';
import { SoopChannelInfo } from '../raw/soop.js';
import { liveFromChzzk, liveFromSoop, LiveInfo } from './live.js';
import { PlatformType } from '../../storage/platform.business.schema.js';

export interface ChannelBase {
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platform: PlatformType;
}

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
  let profileImgUrl: string | null = info.channelImageUrl;
  if (profileImgUrl === '') {
    profileImgUrl = null;
  }
  return {
    platform: 'chzzk',
    pid: info.channelId,
    username: info.channelName,
    profileImgUrl,
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
  let profileImgUrl: string | null = info.profileImageUrl;
  if (profileImgUrl === '') {
    profileImgUrl = null;
  }
  return {
    platform: 'soop',
    pid: info.userId,
    username: info.userNick,
    profileImgUrl,
    followerCnt: info.fanCnt,
    openLive: info.openLive,
    content: info,
    liveInfo,
  };
}
