import { faker } from '@faker-js/faker';
import { ChannelEnt } from './channel.entity.schema.js';

export function dummyChannelEnt(overrides: Partial<ChannelEnt> = {}): ChannelEnt {
  return {
    id: faker.string.uuid(),
    platformId: faker.string.uuid(),
    sourceId: faker.string.uuid(),
    username: faker.string.uuid(),
    profileImgUrl: faker.string.uuid(),
    followerCnt: faker.number.int({ min: 1, max: 100 }),
    gradeId: faker.string.uuid(),
    isFollowed: faker.datatype.boolean(),
    overseasFirst: faker.datatype.boolean(),
    adultOnly: faker.datatype.boolean(),
    description: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    lastRefreshedAt: faker.date.recent(),
    streamCheckedAt: faker.date.recent(),
    ...overrides,
  };
}
