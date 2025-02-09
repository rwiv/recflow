import { MissingValueError } from './errors/errors/MissingValueError.js';

export function notNull<T>(value: T | null | undefined, name: string | undefined = undefined): T {
  if (value === null || value === undefined) {
    if (name) {
      throw new MissingValueError(`"${name}" expected not null`);
    } else {
      throw new MissingValueError('Expected not null');
    }
  }
  return value;
}
