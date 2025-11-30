import { faker } from '@faker-js/faker';

import { dummyPlatformDto } from '@/platform/spec/storage/platform.dto.schema.dummy.js';

import { CriterionUnitDto, PlatformCriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

export function dummyCriterionUnit(overrides: Partial<CriterionUnitDto> = {}): CriterionUnitDto {
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

function newDummyUnits(values: string[], min: number, max: number): CriterionUnitDto[] {
  return faker.helpers.arrayElements(values, { min, max }).map((v) => dummyCriterionUnit({ value: v }));
}

export function dummyPlatformCriterionDto(overrides: Partial<PlatformCriterionDto> = {}): PlatformCriterionDto {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    platform: dummyPlatformDto(),
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
    positiveTags: newDummyUnits(['Game', 'Music', 'Cooking', 'Exercise', 'Reading'], 1, 3),
    negativeTags: newDummyUnits(['Inappropriate', 'Spam', 'Advertisement'], 0, 2),
    positiveKeywords: newDummyUnits(['Fun', 'Useful', 'Interesting'], 1, 3),
    negativeKeywords: newDummyUnits(['Boring', 'Useless', 'Disappointing'], 0, 2),
    positiveWps: newDummyUnits(['Good', 'Excellent', 'Perfect'], 1, 3),
    negativeWps: newDummyUnits(['Bad', 'Worst', 'Failure'], 0, 2),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
