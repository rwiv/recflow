import { faker } from '@faker-js/faker';
import { mockPlatformDto } from 'src/platform/spec/storage/platform.dto.schema.mocks.js';
import { ChannelAppend, ChannelDto } from './channel.dto.schema.js';
import { mockPriorityDto } from './priority.schema.mocks.js';

export function mockChannelAppend(overrides: Partial<ChannelAppend> = {}): ChannelAppend {
  return {
    platformId: faker.string.uuid(),
    pid: faker.string.uuid(),
    username: faker.string.uuid(),
    profileImgUrl: faker.string.uuid(),
    followerCnt: faker.number.int({ min: 1, max: 100 }),
    priorityId: faker.string.uuid(),
    isFollowed: faker.datatype.boolean(),
    ...overrides,
  };
}

export function mockChannelDto(overrides: Partial<ChannelDto> = {}): ChannelDto {
  return {
    id: faker.string.uuid(),
    pid: faker.string.uuid(),
    username: faker.string.uuid(),
    profileImgUrl: faker.string.uuid(),
    followerCnt: faker.number.int({ min: 1, max: 100 }),
    isFollowed: faker.datatype.boolean(),
    overseasFirst: faker.datatype.boolean(),
    adultOnly: faker.datatype.boolean(),
    description: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    lastRefreshedAt: faker.date.recent(),
    platform: mockPlatformDto(),
    priority: mockPriorityDto(),
    ...overrides,
  };
}
