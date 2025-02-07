import { ValidationError } from './errors/errors/ValidationError.js';
import { NotFoundError } from './errors/errors/NotFoundError.js';

export function oneNotNull<T>(list: T[]): T {
  if (list.length === 0) {
    throw new NotFoundError('Expected exactly one element');
  }
  if (list.length > 1) {
    throw new ValidationError('Expected exactly one element');
  }
  return list[0];
}

export function oneNullable<T>(list: T[]): T | undefined {
  if (list.length === 0) {
    return undefined;
  }
  if (list.length > 1) {
    throw new ValidationError('Expected exactly one element');
  }
  return list[0];
}

export function hasDuplicates(arr: string[]): boolean {
  return new Set(arr).size !== arr.length;
}

export function randomElem<T>(array: readonly T[]): T {
  if (!Array.isArray(array) || array.length === 0) {
    throw new NotFoundError('Array is empty or not an array');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
