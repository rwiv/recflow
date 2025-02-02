import { faker } from '@faker-js/faker';
import { LiveRecord, NodeRecord } from '@/client/types.ts';
import { randomElem } from '@/lib/list.ts';

export function mockLiveRecord(): LiveRecord {
  return {
    type: randomElem(['chzzk', 'soop']),
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
    type: randomElem(['main', 'sub', 'extra']),
    url: faker.internet.url(),
    chzzkCapacity: faker.number.int({ min: 10, max: 100 }),
    soopCapacity: faker.number.int({ min: 10, max: 100 }),
    chzzkAssignedCnt: faker.number.int({ min: 0, max: 100 }),
    soopAssignedCnt: faker.number.int({ min: 0, max: 100 }),
  };
}
