import { faker } from '@faker-js/faker';
import { LiveDto } from '@/client/live/live.types.ts';
import { randomElem } from '@/lib/list.ts';
import { ChannelDto } from '@/client/channel/channel.types.ts';
import { TagDto } from '@/client/channel/tag.schema.ts';
import { PlatformDto, platformNameEnum } from '@/client/common/platform.schema.ts';

export function mockLive(): LiveDto {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    platform: mockPlatform(),
    channel: mockChannel(),
    nodeId: faker.string.uuid().replace(/-/g, ''),
    liveTitle: faker.lorem.sentence(),
    viewCnt: faker.number.int({ min: 10, max: 10000 }),
    isAdult: randomElem([true, false]),
    createdAt: faker.date.anytime().toISOString(),
    updatedAt: faker.date.anytime().toISOString(),
    deletedAt: faker.date.anytime().toISOString(),
    isDisabled: randomElem([true, false]),
    node: undefined,
  };
}

export function mockNode() {
  return {};
}

export function mockPlatform(): PlatformDto {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    name: randomElem(platformNameEnum.options),
    createdAt: faker.date.anytime().toISOString(),
    updatedAt: faker.date.anytime().toISOString(),
  };
}

export function mockChannel(): ChannelDto {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    pid: faker.string.uuid().replace(/-/g, ''),
    username: faker.internet.username(),
    profileImgUrl: faker.image.avatar(),
    followerCnt: faker.number.int({ min: 10, max: 10000 }),
    platform: mockPlatform(),
    priority: {
      id: faker.string.uuid().replace(/-/g, ''),
      name: randomElem(['must', 'should', 'may', 'review', 'skip', 'none']),
      tier: faker.number.int({ min: 1, max: 3 }),
      seq: faker.number.int({ min: 1, max: 8 }),
      shouldNotify: randomElem([true, false]),
      createdAt: faker.date.anytime(),
      updatedAt: faker.date.anytime(),
    },
    isFollowed: randomElem([true, false]),
    description: faker.lorem.sentence(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    tags: mockTags(faker.number.int({ min: 0, max: 5 })),
  };
}

export function mockTag(): TagDto {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
  };
}

export function mockTags(n: number): TagDto[] {
  return Array.from({ length: n }, () => mockTag());
}
