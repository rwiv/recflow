import { faker } from '@faker-js/faker';
import { PriorityDto } from './priority.schema.js';

export function mockPriorityDto(overrides: Partial<PriorityDto> = {}): PriorityDto {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    tier: faker.number.int({ min: 1, max: 10 }),
    seq: faker.number.int({ min: 1, max: 10 }),
    shouldSave: faker.datatype.boolean(),
    shouldNotify: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
