import { ChzzkLiveInfo } from './chzzk.dto.js';
import { SoopLiveInfo } from './soop.dto.js';

export type PlatformType = 'chzzk' | 'soop';
export type PlatformLiveInfo = ChzzkLiveInfo | SoopLiveInfo;
