import { ChzzkChannelInfo } from '../raw/chzzk.js';
import { mockChzzkChannelInfo } from '../raw/chzzk.mocks.js';
import { SoopChannelInfo } from '../raw/soop.js';
import { mockSoopChannelInfo } from '../raw/soop.mocks.js';
import { channelFromChzzk, channelFromSoop, channelLiveInfo, ChannelLiveInfo } from './channel.js';
import { LiveInfo } from './live.js';

export function dummyChzzkChannelLiveInfo(
  overrides: Partial<ChzzkChannelInfo> = {},
  liveInfo?: LiveInfo,
): ChannelLiveInfo {
  const channelInfo = channelFromChzzk(mockChzzkChannelInfo(overrides));
  if (liveInfo) {
    channelInfo.liveInfo = liveInfo;
  }
  return channelLiveInfo.parse(channelInfo);
}

export function dummySoopChannelLiveInfo(
  overrides: Partial<SoopChannelInfo> = {},
  liveInfo?: LiveInfo,
): ChannelLiveInfo {
  const channelInfo = channelFromSoop(mockSoopChannelInfo(overrides));
  if (liveInfo) {
    channelInfo.liveInfo = liveInfo;
  }
  return channelLiveInfo.parse(channelInfo);
}
