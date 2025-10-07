import { faker } from '@faker-js/faker';
import { GradeDto } from './grade.schema.js';

export function dummyGradeDto(overrides: Partial<GradeDto> = {}): GradeDto {
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
