import { LiveInfo } from '../spec/wapper/live.js';
import { ChannelInfo } from '../spec/wapper/channel.js';

export interface IFetcher {
  fetchLives(): Promise<LiveInfo[]>;
  fetchChannel(uid: string, hasLiveInfo: boolean): Promise<ChannelInfo>;
}
