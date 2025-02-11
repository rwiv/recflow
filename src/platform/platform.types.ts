import { ChzzkChannelInfo, ChzzkLiveInfo } from './data/raw/chzzk.js';
import { SoopChannelInfo, SoopLiveInfo } from './data/raw/soop.js';
import { LiveInfo } from './data/wapper/live.js';
import { ChannelInfo } from './data/wapper/channel.js';

export type PlatformLiveInfo = ChzzkLiveInfo | SoopLiveInfo;
export type PlatformChannelInfo = ChzzkChannelInfo | SoopChannelInfo;

export interface IFetcher {
  fetchLives(): Promise<LiveInfo[]>;
  fetchChannel(uid: string, hasLiveInfo: boolean): Promise<ChannelInfo>;
}
