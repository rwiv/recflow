import { dummyChzzkChannelInfo } from '@/platform/spec/raw/chzzk.dummy.js';
import { ChzzkChannelInfo } from '@/platform/spec/raw/chzzk.js';
import { dummySoopChannelInfo } from '@/platform/spec/raw/soop.dummy.js';
import { SoopChannelInfo } from '@/platform/spec/raw/soop.js';
import { ChannelInfo, channelFromChzzk, channelFromSoop, channelInfo } from '@/platform/spec/wapper/channel.js';
import { LiveInfo } from '@/platform/spec/wapper/live.js';

export function dummyChannelInfoChzzk(
  overrides: Partial<ChzzkChannelInfo> = {},
  liveInfo?: LiveInfo | null,
): ChannelInfo {
  const chInfo = channelFromChzzk(dummyChzzkChannelInfo(overrides));
  if (liveInfo !== undefined) {
    chInfo.liveInfo = liveInfo;
  }
  return channelInfo.parse(chInfo);
}

export function dummyChannelInfoSoop(overrides: Partial<SoopChannelInfo> = {}, liveInfo?: LiveInfo): ChannelInfo {
  const chInfo = channelFromSoop(dummySoopChannelInfo(overrides));
  if (liveInfo !== undefined) {
    chInfo.liveInfo = liveInfo;
  }
  return channelInfo.parse(chInfo);
}
