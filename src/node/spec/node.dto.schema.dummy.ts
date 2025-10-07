import { faker } from '@faker-js/faker';
import { NodeAppend, NodeDto } from './node.dto.schema.js';

export function dummyNodeAppend(overrides: Partial<NodeAppend> = {}): NodeAppend {
  return {
    name: faker.lorem.words(2),
    endpoint: faker.internet.url(),
    priority: faker.number.int({ min: 1, max: 100 }),
    groupId: faker.string.uuid(),
    capacity: faker.number.int({ min: 1, max: 100 }),
    ...overrides,
  };
}

export function dummyNodeDto(overrides: Partial<NodeDto> = {}): NodeDto {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    endpoint: faker.internet.url(),
    priority: faker.number.int({ min: 1, max: 100 }),
    groupId: faker.string.uuid(),
    capacity: faker.number.int({ min: 1, max: 100 }),
    isCordoned: faker.datatype.boolean(),
    isDomestic: faker.datatype.boolean(),
    livesCnt: faker.number.int({ min: 0, max: 3 }),
    failureCnt: faker.number.int({ min: 0, max: 100 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    lastAssignedAt: faker.date.recent(),
    ...overrides,
  };
}
