import { faker } from '@faker-js/faker';
import { platformNameEnum } from './platform.enum.schema.js';
import { PlatformDto } from './platform.dto.schema.js';

export function mockPlatformDto(overrides: Partial<PlatformDto> = {}): PlatformDto {
  return {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(platformNameEnum.options),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
