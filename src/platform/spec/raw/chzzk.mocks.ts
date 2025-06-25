import { faker } from '@faker-js/faker';
import { ChzzkChannelInfo, ChzzkLiveInfo } from './chzzk.js';

export function mockChzzkLiveInfo(overrides: Partial<ChzzkLiveInfo> = {}): ChzzkLiveInfo {
  return {
    channelId: faker.string.alphanumeric(10),
    channelName: faker.internet.displayName(),
    channelImageUrl: faker.image.avatar(),
    liveId: faker.number.int({ min: 1, max: 999999 }),
    liveTitle: faker.lorem.sentence(),
    liveImageUrl: faker.image.url(),
    concurrentUserCount: faker.number.int({ min: 1, max: 5000 }),
    openDate: faker.date.recent().toISOString().split('T')[0],
    adult: faker.datatype.boolean(),
    tags: faker.helpers.arrayElements(['Game', 'Music', 'Cooking', 'Exercise', 'Reading'], {
      min: 1,
      max: 3,
    }),
    liveCategoryValue: faker.helpers.arrayElement(['Game', 'Music', 'Cooking', 'Exercise', 'Reading']),
    watchPartyNo: faker.number.int({ min: 1, max: 100 }),
    watchPartyTag: faker.helpers.arrayElement(['Party', 'Together', 'Joy']),
    liveCategory: null,
    categoryType: null,
    ...overrides,
  };
}

export function mockChzzkChannelInfo(overrides: Partial<ChzzkChannelInfo> = {}): ChzzkChannelInfo {
  const channelInfo = {
    channelId: faker.string.alphanumeric(10),
    channelName: faker.internet.displayName(),
    channelImageUrl: faker.image.avatar(),
    followerCount: faker.number.int({ min: 100, max: 1000000 }),
    openLive: faker.datatype.boolean(),
    liveInfo: null,
    ...overrides,
  };
  channelInfo.liveInfo = mockChzzkLiveInfo({
    channelId: channelInfo.channelId,
    channelName: channelInfo.channelName,
    channelImageUrl: channelInfo.channelImageUrl,
  });
  return channelInfo;
}
