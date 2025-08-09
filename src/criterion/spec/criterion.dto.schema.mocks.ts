import { faker } from '@faker-js/faker';
import { PlatformCriterionDto } from './criterion.dto.schema.js';
import { mockPlatformDto } from '../../platform/spec/storage/platform.dto.schema.mocks.js';

export function mockPlatformCriterionDto(overrides: Partial<PlatformCriterionDto> = {}): PlatformCriterionDto {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    platform: mockPlatformDto(),
    isDeactivated: faker.datatype.boolean(),
    adultOnly: faker.datatype.boolean(),
    enforceCreds: faker.datatype.boolean(),
    domesticOnly: faker.datatype.boolean(),
    overseasFirst: faker.datatype.boolean(),
    loggingOnly: faker.datatype.boolean(),
    minUserCnt: faker.number.int({ min: 5, max: 100 }),
    positiveTags: faker.helpers.arrayElements(['Game', 'Music', 'Cooking', 'Exercise', 'Reading'], {
      min: 1,
      max: 3,
    }),
    negativeTags: faker.helpers.arrayElements(['Inappropriate', 'Spam', 'Advertisement'], { min: 0, max: 2 }),
    positiveKeywords: faker.helpers.arrayElements(['Fun', 'Useful', 'Interesting'], { min: 1, max: 3 }),
    negativeKeywords: faker.helpers.arrayElements(['Boring', 'Useless', 'Disappointing'], { min: 0, max: 2 }),
    positiveWps: faker.helpers.arrayElements(['Good', 'Excellent', 'Perfect'], { min: 1, max: 3 }),
    negativeWps: faker.helpers.arrayElements(['Bad', 'Worst', 'Failure'], { min: 0, max: 2 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
