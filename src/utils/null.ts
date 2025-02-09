import { NotFoundError } from './errors/errors/NotFoundError.js';

export function notNull<T>(value: T | null | undefined, name: string | undefined = undefined): T {
  if (value === null || value === undefined) {
    if (name) {
      throw new NotFoundError(`"${name}" expected not null`);
    } else {
      throw new NotFoundError('Expected not null');
    }
  }
  return value;
}
