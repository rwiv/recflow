import { z } from 'zod';

import { nnint, nonempty } from '@/common/data/common.schema.js';

import { ChzzkChannelInfo, chzzkChannelInfo } from '@/platform/spec/raw/chzzk.js';
import { SoopChannelInfo, soopChannelInfo } from '@/platform/spec/raw/soop.js';
import { platformNameEnum } from '@/platform/spec/storage/platform.enum.schema.js';
import { liveFromChzzk, liveFromSoop, liveInfo } from '@/platform/spec/wapper/live.js';

export const channelInfo = z.object({
  sourceId: nonempty,
  username: nonempty,
  profileImgUrl: nonempty.nullable(),
  followerCnt: nnint,
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
    sourceId: info.channelId,
    username: info.channelName,
    profileImgUrl: info.channelImageUrl ?? null,
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
    sourceId: info.userId,
    username: info.userNick,
    profileImgUrl: info.profileImageUrl ?? null,
    followerCnt: info.fanCnt,
    openLive: info.openLive,
    content: info,
    liveInfo,
  };
}
