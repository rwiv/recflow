import { dummyChzzkLiveInfo } from '@/platform/spec/raw/chzzk.dummy.js';
import { ChzzkLiveInfo } from '@/platform/spec/raw/chzzk.js';
import { dummySoopLiveInfo } from '@/platform/spec/raw/soop.dummy.js';
import { SoopLiveInfo } from '@/platform/spec/raw/soop.js';
import { LiveInfo, liveFromChzzk, liveFromSoop } from '@/platform/spec/wapper/live.js';

export function dummyLiveInfoChzzk(overrides: Partial<ChzzkLiveInfo> = {}): LiveInfo {
  return liveFromChzzk(dummyChzzkLiveInfo(overrides));
}

export function dummyLiveInfoSoop(overrides: Partial<SoopLiveInfo> = {}): LiveInfo {
  return liveFromSoop(dummySoopLiveInfo(overrides));
}
