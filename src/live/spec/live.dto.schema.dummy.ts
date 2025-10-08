import { faker } from '@faker-js/faker';
import { LiveDto, LiveStreamDto } from './live.dto.schema.js';
import { dummyPlatformDto } from '../../platform/spec/storage/platform.dto.schema.dummy.js';
import { dummyChannelDto } from '../../channel/spec/channel.dto.schema.dummy.js';
import { liveStatus } from './live.entity.schema.js';

export function dummyLiveStreamDto(overrides: Partial<LiveStreamDto> = {}): LiveStreamDto {
  return {
    id: faker.string.uuid(),
    sourceId: faker.string.alphanumeric(10),
    channel: dummyChannelDto(),
    url: faker.internet.url(),
    params: null,
    headers: {},
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    checkedAt: faker.date.recent(),
    ...overrides,
  };
}

export function dummyLiveDto(overrides: Partial<LiveDto> = {}): LiveDto {
  const platform = dummyPlatformDto();
  const stream = dummyLiveStreamDto();
  const channel = stream.channel;
  return {
    id: faker.string.uuid(),
    channel,
    platform,
    sourceId: faker.string.alphanumeric(10),
    liveTitle: faker.lorem.sentence(),
    liveDetails: null,
    liveStreamId: stream.id,
    stream,
    fsName: faker.lorem.sentence(),
    videoName: faker.lorem.sentence(),
    viewCnt: 0,
    isAdult: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(liveStatus.options),
    isDisabled: faker.datatype.boolean(),
    domesticOnly: faker.datatype.boolean(),
    overseasFirst: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: faker.date.recent(),
    ...overrides,
  };
}
