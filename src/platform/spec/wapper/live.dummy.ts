import { ChzzkLiveInfo } from '../raw/chzzk.js';
import { dummyChzzkLiveInfo } from '../raw/chzzk.dummy.js';
import { SoopLiveInfo } from '../raw/soop.js';
import { dummySoopLiveInfo } from '../raw/soop.dummy.js';
import { liveFromChzzk, liveFromSoop, LiveInfo } from './live.js';

export function dummyLiveInfoChzzk(overrides: Partial<ChzzkLiveInfo> = {}): LiveInfo {
  return liveFromChzzk(dummyChzzkLiveInfo(overrides));
}

export function dummyLiveInfoSoop(overrides: Partial<SoopLiveInfo> = {}): LiveInfo {
  return liveFromSoop(dummySoopLiveInfo(overrides));
}
