import { faker } from '@faker-js/faker';
import { LiveRecord } from '@/client/live.types.ts';
import { randomElem } from '@/lib/list.ts';
import { PLATFORM_TYPES } from '@/common/enum.consts.ts';
import { ChannelRecord } from '@/client/channel.types.ts';
import { TagRecord } from '@/client/tag.types.ts';
import { NodeRecord } from '@/client/node.schema.ts';

export function mockLiveRecord(): LiveRecord {
  return {
    type: randomElem(PLATFORM_TYPES),
    channelId: faker.string.uuid().replace(/-/g, ''),
    channelName: faker.internet.username(),
    liveId: faker.number.int({ min: 100000, max: 999999 }),
    liveTitle: faker.lorem.sentence(),
    viewCnt: faker.number.int({ min: 10, max: 10000 }),
    adult: randomElem([true, false]),
    openDate: faker.date.anytime().toISOString(),
    savedAt: faker.date.anytime().toISOString(),
    updatedAt: faker.date.anytime().toISOString(),
    deletedAt: faker.date.anytime().toISOString(),
    isDeleted: randomElem([true, false]),
    assignedWebhookName: faker.lorem.word(),
  };
}

export function mockNode(): NodeRecord {
  return {
    name: faker.lorem.word(),
    type: randomElem(['main', 'sub']),
    url: faker.internet.url(),
    chzzkCapacity: faker.number.int({ min: 10, max: 100 }),
    soopCapacity: faker.number.int({ min: 10, max: 100 }),
    chzzkAssignedCnt: faker.number.int({ min: 0, max: 100 }),
    soopAssignedCnt: faker.number.int({ min: 0, max: 100 }),
  };
}

export function mockChannel(): ChannelRecord {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    pid: faker.string.uuid().replace(/-/g, ''),
    username: faker.internet.username(),
    profileImgUrl: faker.image.avatar(),
    followerCnt: faker.number.int({ min: 10, max: 10000 }),
    platform: {
      id: faker.string.uuid().replace(/-/g, ''),
      name: randomElem(PLATFORM_TYPES),
      createdAt: faker.date.anytime(),
      updatedAt: faker.date.anytime(),
    },
    priority: {
      id: faker.string.uuid().replace(/-/g, ''),
      name: randomElem(['must', 'should', 'may', 'review', 'skip', 'none']),
      tier: faker.number.int({ min: 1, max: 3 }),
      createdAt: faker.date.anytime(),
      updatedAt: faker.date.anytime(),
    },
    followed: randomElem([true, false]),
    description: faker.lorem.sentence(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    tags: mockTags(faker.number.int({ min: 0, max: 5 })),
  };
}

export function mockTag(): TagRecord {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
  };
}

export function mockTags(n: number): TagRecord[] {
  return Array.from({ length: n }, () => mockTag());
}
