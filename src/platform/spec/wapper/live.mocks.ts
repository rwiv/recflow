import { ChzzkLiveInfo } from '../raw/chzzk.js';
import { dummyChzzkLiveInfo } from '../raw/chzzk.mocks.js';
import { SoopLiveInfo } from '../raw/soop.js';
import { mockSoopLiveInfo } from '../raw/soop.mocks.js';
import { liveFromChzzk, liveFromSoop, LiveInfo } from './live.js';

export function mockLiveInfoChzzk(overrides: Partial<ChzzkLiveInfo> = {}): LiveInfo {
  return liveFromChzzk(dummyChzzkLiveInfo(overrides));
}

export function mockLiveInfoSoop(overrides: Partial<SoopLiveInfo> = {}): LiveInfo {
  return liveFromSoop(mockSoopLiveInfo(overrides));
}
