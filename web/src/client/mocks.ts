import { faker } from '@faker-js/faker';
import { LiveRecord } from '@/client/live.types.ts';
import { randomElem } from '@/lib/list.ts';
import { CHANNEL_PRIORITIES, NODE_PRIORITIES, PLATFORM_TYPES } from '@/common/enum.consts.ts';
import { ChannelRecord } from '@/client/channel.types.ts';
import { TagRecord } from '@/client/tag.types.ts';
import { NodeRecord } from '@/client/node.types.ts';

export function mockLiveRecord(): LiveRecord {
  return {
    type: randomElem(['chzzk', 'soop', 'twitch']),
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
    type: randomElem(NODE_PRIORITIES),
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
    platform: randomElem(PLATFORM_TYPES),
    followed: randomElem([true, false]),
    priority: randomElem(CHANNEL_PRIORITIES),
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
