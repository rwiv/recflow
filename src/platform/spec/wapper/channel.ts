import { chzzkChannelInfo, ChzzkChannelInfo } from '../raw/chzzk.js';
import { soopChannelInfo, SoopChannelInfo } from '../raw/soop.js';
import { liveFromChzzk, liveFromSoop, liveInfo, LiveInfo } from './live.js';
import { z } from 'zod';
import { platformNameEnum } from '../storage/platform.enum.schema.js';

export const channelInfo = z.object({
  pid: z.string(),
  username: z.string(),
  profileImgUrl: z.string().nullable(),
  followerCnt: z.number(),
  platform: platformNameEnum,
  openLive: z.boolean(),
  content: z.union([chzzkChannelInfo, soopChannelInfo]),
  liveInfo: liveInfo.nullable(),
});
export type ChannelInfo = z.infer<typeof channelInfo>;

export const channelLiveInfo = channelInfo.extend({
  liveInfo: liveInfo,
});
export type ChannelLiveInfo = z.infer<typeof channelLiveInfo>;

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
