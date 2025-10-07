import { ChzzkChannelInfo } from '../raw/chzzk.js';
import { dummyChzzkChannelInfo } from '../raw/chzzk.dummy.js';
import { SoopChannelInfo } from '../raw/soop.js';
import { dummySoopChannelInfo } from '../raw/soop.dummy.js';
import { channelFromChzzk, channelFromSoop, channelLiveInfo, ChannelLiveInfo } from './channel.js';
import { LiveInfo } from './live.js';

export function dummyChzzkChannelLiveInfo(
  overrides: Partial<ChzzkChannelInfo> = {},
  liveInfo?: LiveInfo,
): ChannelLiveInfo {
  const channelInfo = channelFromChzzk(dummyChzzkChannelInfo(overrides));
  if (liveInfo) {
    channelInfo.liveInfo = liveInfo;
  }
  return channelLiveInfo.parse(channelInfo);
}

export function dummySoopChannelLiveInfo(
  overrides: Partial<SoopChannelInfo> = {},
  liveInfo?: LiveInfo,
): ChannelLiveInfo {
  const channelInfo = channelFromSoop(dummySoopChannelInfo(overrides));
  if (liveInfo) {
    channelInfo.liveInfo = liveInfo;
  }
  return channelLiveInfo.parse(channelInfo);
}
