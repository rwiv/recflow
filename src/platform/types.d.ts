import { ChzzkChannelInfo, ChzzkLiveInfo } from './chzzk.js';
import { SoopChannelInfo, SoopLiveInfo } from './soop.js';

export type PlatformType = 'chzzk' | 'soop';
export type PlatformLiveInfo = ChzzkLiveInfo | SoopLiveInfo;
export type PlatformChannelInfo = ChzzkChannelInfo | SoopChannelInfo;
