import { NotFoundError } from './errors/errors/NotFoundError.js';

export function assertNotNull<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new NotFoundError('Expected not null');
  }
  return value;
}
