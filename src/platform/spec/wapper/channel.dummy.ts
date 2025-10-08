import { ChzzkChannelInfo } from '../raw/chzzk.js';
import { SoopChannelInfo } from '../raw/soop.js';
import { dummyChzzkChannelInfo } from '../raw/chzzk.dummy.js';
import { dummySoopChannelInfo } from '../raw/soop.dummy.js';
import { channelFromChzzk, channelFromSoop, channelInfo, ChannelInfo } from './channel.js';
import { LiveInfo } from './live.js';

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
