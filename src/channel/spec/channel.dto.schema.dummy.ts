import { faker } from '@faker-js/faker';
import { ChannelAppend, ChannelDto } from './channel.dto.schema.js';
import { dummyGradeDto } from './grade.schema.dummy.js';
import { dummyPlatformDto } from '../../platform/spec/storage/platform.dto.schema.dummy.js';
import { ChannelEntAppend } from './channel.entity.schema.js';

export function dummyChannelEntAppend(overrides: Partial<ChannelAppend> = {}): ChannelEntAppend {
  return {
    platformId: faker.string.uuid(),
    sourceId: faker.string.uuid(),
    username: faker.string.uuid(),
    profileImgUrl: faker.string.uuid(),
    followerCnt: faker.number.int({ min: 1, max: 100 }),
    gradeId: faker.string.uuid(),
    isFollowed: faker.datatype.boolean(),
    ...overrides,
  };
}

export function dummyChannelAppend(overrides: Partial<ChannelAppend> = {}): ChannelAppend {
  return dummyChannelEntAppend(overrides);
}

export function dummyChannelDto(overrides: Partial<ChannelDto> = {}): ChannelDto {
  return {
    id: faker.string.uuid(),
    sourceId: faker.string.uuid(),
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
    streamCheckedAt: faker.date.recent(),
    platform: dummyPlatformDto(),
    grade: dummyGradeDto(),
    ...overrides,
  };
}
