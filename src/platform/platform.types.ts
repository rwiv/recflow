import { ChzzkChannelInfo, ChzzkLiveInfo } from './raw/chzzk.js';
import { SoopChannelInfo, SoopLiveInfo } from './raw/soop.js';
import { LiveInfo } from './wapper/live.js';
import { ChannelInfo } from './wapper/channel.js';

export type PlatformLiveInfo = ChzzkLiveInfo | SoopLiveInfo;
export type PlatformChannelInfo = ChzzkChannelInfo | SoopChannelInfo;

export interface IFetcher {
  fetchLives(): Promise<LiveInfo[]>;
  fetchChannel(uid: string, hasLiveInfo: boolean): Promise<ChannelInfo | null>;
}
