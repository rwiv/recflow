import { ChzzkChannelInfo, ChzzkLiveInfo } from './chzzk.js';
import { SoopChannelInfo, SoopLiveInfo } from './soop.js';
import { LiveInfo } from './live.js';
import { ChannelInfo } from './channel.js';

export type PlatformType = 'chzzk' | 'soop';
export type PlatformLiveInfo = ChzzkLiveInfo | SoopLiveInfo;
export type PlatformChannelInfo = ChzzkChannelInfo | SoopChannelInfo;

export interface PlatformFetcher {
  fetchLives(): Promise<LiveInfo[]>;
  fetchChannel(uid: string, hasLiveInfo: boolean): Promise<ChannelInfo | null>;
}
