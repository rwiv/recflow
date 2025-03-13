import { ChzzkLiveInfo } from '../../platform/spec/raw/chzzk.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';

export function mockChzzkLiveInfo(n: number, pid: string): ChzzkLiveInfo {
  return {
    channelId: pid,
    channelImageUrl: 'https://ch1.com',
    channelName: `ch${n}`,
    liveId: 1,
    liveImageUrl: 'https://live1.com',
    liveTitle: `live${n}`,
    concurrentUserCount: 1,
    accumulateCount: 1,
    openDate: '2021-01-01',
    adult: false,
    tags: ['tag1'],
    liveCategoryValue: 'category1',
    watchPartyNo: 1,
    watchPartyTag: 'tag1',
    liveCategory: null,
    categoryType: null,
  };
}

export function mockLiveInfo(n: number, pid: string): LiveInfo {
  return {
    type: 'chzzk',
    pid,
    channelName: `ch${n}`,
    liveId: 1,
    liveTitle: `live${n}`,
    viewCnt: 1,
    isAdult: false,
    openDate: '2021-01-01',
    content: mockChzzkLiveInfo(n, pid),
  };
}
