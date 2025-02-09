import { ChzzkLiveInfo } from '../../platform/raw/chzzk.js';
import { LiveInfo } from '../../platform/wapper/live.js';

export function mockChzzkLiveInfo(n: number, channelId: string): ChzzkLiveInfo {
  return {
    channelId,
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
  };
}

export function mockLiveInfo(n: number, channelId: string): LiveInfo {
  return {
    type: 'chzzk',
    channelId,
    channelName: `ch${n}`,
    liveId: 1,
    liveTitle: `live${n}`,
    viewCnt: 1,
    adult: false,
    openDate: '2021-01-01',
    content: mockChzzkLiveInfo(n, channelId),
  };
}
