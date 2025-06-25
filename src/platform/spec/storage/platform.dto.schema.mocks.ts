import { faker } from '@faker-js/faker';
import { PlatformDto } from 'src/platform/spec/storage/platform.dto.schema.js';
import { platformNameEnum } from './platform.enum.schema.js';

export function mockPlatformDto(overrides: Partial<PlatformDto> = {}): PlatformDto {
  return {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(platformNameEnum.options),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
