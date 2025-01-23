import { faker } from '@faker-js/faker';
import { LiveInfo, WebhookState } from '@/components/client/types.ts';
import { randomElem } from '@/lib/list.ts';

export function mockLiveInfo(): LiveInfo {
  return {
    type: randomElem(['chzzk', 'soop', 'twitch']),
    channelId: faker.string.uuid().replace(/-/g, ''),
    channelName: faker.internet.username(),
    liveTitle: faker.lorem.sentence(),
    viewCnt: faker.number.int({ min: 10, max: 10000 }),
    adult: randomElem([true, false]),
    assignedWebhookName: faker.lorem.word(),
  };
}

export function mockWebhookState(): WebhookState {
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
