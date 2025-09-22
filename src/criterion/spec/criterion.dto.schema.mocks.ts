import { faker } from '@faker-js/faker';
import { CriterionUnitDto, PlatformCriterionDto } from './criterion.dto.schema.js';
import { mockPlatformDto } from '../../platform/spec/storage/platform.dto.schema.mocks.js';

export function mockCriterionUnit(overrides: Partial<CriterionUnitDto> = {}): CriterionUnitDto {
  return {
    id: faker.string.uuid(),
    criterionId: faker.string.uuid(),
    ruleId: faker.string.uuid(),
    value: faker.lorem.words(),
    isPositive: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

function createMockUnits(values: string[], min: number, max: number): CriterionUnitDto[] {
  return faker.helpers.arrayElements(values, { min, max }).map((v) => mockCriterionUnit({ value: v }));
}

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
    tagRuleId: faker.string.uuid(),
    keywordRuleId: faker.string.uuid(),
    cateRuleId: faker.string.uuid(),
    wpRuleId: faker.string.uuid(),
    positiveTags: createMockUnits(['Game', 'Music', 'Cooking', 'Exercise', 'Reading'], 1, 3),
    negativeTags: createMockUnits(['Inappropriate', 'Spam', 'Advertisement'], 0, 2),
    positiveKeywords: createMockUnits(['Fun', 'Useful', 'Interesting'], 1, 3),
    negativeKeywords: createMockUnits(['Boring', 'Useless', 'Disappointing'], 0, 2),
    positiveWps: createMockUnits(['Good', 'Excellent', 'Perfect'], 1, 3),
    negativeWps: createMockUnits(['Bad', 'Worst', 'Failure'], 0, 2),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
