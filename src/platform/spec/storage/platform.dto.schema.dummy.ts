import { faker } from '@faker-js/faker';

import { PlatformDto } from '@/platform/spec/storage/platform.dto.schema.js';
import { platformNameEnum } from '@/platform/spec/storage/platform.enum.schema.js';

export function dummyPlatformDto(overrides: Partial<PlatformDto> = {}): PlatformDto {
  return {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(platformNameEnum.options),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
