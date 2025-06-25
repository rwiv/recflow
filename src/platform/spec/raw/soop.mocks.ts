import { faker } from '@faker-js/faker';
import { SoopChannelInfo, SoopLiveInfo } from './soop.js';

export function mockSoopLiveInfo(overrides: Partial<SoopLiveInfo> = {}): SoopLiveInfo {
  return {
    userId: faker.string.alphanumeric(10),
    userNick: faker.internet.displayName(),
    broadStart: faker.date.recent().toISOString(),
    broadNo: faker.string.alphanumeric(8),
    broadTitle: faker.lorem.sentence(),
    broadCateNo: faker.helpers.arrayElement(['1', '2', '3', '4', '5']),
    viewCnt: faker.number.int({ min: 1, max: 10000 }),
    hashTags: faker.helpers.arrayElements(['#Game', '#Music', '#Cooking', '#Exercise', '#Reading'], {
      min: 1,
      max: 3,
    }),
    adult: faker.datatype.boolean(),
    locked: faker.datatype.boolean(),
    ...overrides,
  };
}

export function mockSoopChannelInfo(overrides: Partial<SoopChannelInfo> = {}): SoopChannelInfo {
  const channelInfo: SoopChannelInfo = {
    userId: faker.string.alphanumeric(10),
    userNick: faker.internet.displayName(),
    profileImageUrl: faker.image.avatar(),
    fanCnt: faker.number.int({ min: 100, max: 1000000 }),
    broadStart: faker.date.recent().toISOString(),
    openLive: faker.datatype.boolean(),
    liveInfo: null,
    ...overrides,
  };
  channelInfo.liveInfo = mockSoopLiveInfo({
    userId: channelInfo.userId,
    userNick: channelInfo.userNick,
  });
  return channelInfo;
}
