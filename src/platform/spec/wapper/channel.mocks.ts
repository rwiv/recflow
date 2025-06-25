import { ChzzkChannelInfo } from '../raw/chzzk.js';
import { mockChzzkChannelInfo } from '../raw/chzzk.mocks.js';
import { SoopChannelInfo } from '../raw/soop.js';
import { mockSoopChannelInfo } from '../raw/soop.mocks.js';
import { channelFromChzzk, channelFromSoop, channelLiveInfo, ChannelLiveInfo } from './channel.js';

export function mockChzzkChannelLiveInfo(overrides: Partial<ChzzkChannelInfo> = {}): ChannelLiveInfo {
  return channelLiveInfo.parse(channelFromChzzk(mockChzzkChannelInfo(overrides)));
}

export function mockSoopChannelLiveInfo(overrides: Partial<SoopChannelInfo> = {}): ChannelLiveInfo {
  return channelLiveInfo.parse(channelFromSoop(mockSoopChannelInfo(overrides)));
}
