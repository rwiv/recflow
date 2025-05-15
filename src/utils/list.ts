import { ValidationError } from './errors/errors/ValidationError.js';
import { MissingValueError } from './errors/errors/MissingValueError.js';

export function oneNotNull<T>(list: T[]): T {
  if (list.length === 0) {
    throw new MissingValueError('Element is missing');
  }
  if (list.length > 1) {
    throw new ValidationError('Element is not unique');
  }
  return list[0];
}

export function oneNullable<T>(list: T[]): T | null {
  if (list.length === 0) {
    return null;
  }
  if (list.length > 1) {
    throw new ValidationError('Element is not unique');
  }
  return list[0];
}

export function hasDuplicates(arr: string[]): boolean {
  return new Set(arr).size !== arr.length;
}

export function randomElem<T>(array: readonly T[]): T {
  if (!Array.isArray(array) || array.length === 0) {
    throw new ValidationError('Array is empty or not an array');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function subLists<T>(list: T[], n: number): T[][] {
  if (n <= 0) {
    throw new Error('n should be greater than 0');
  }

  const result: T[][] = [];
  let current: T[] = [];

  for (const elem of list) {
    if (current.length >= n) {
      result.push(current);
      current = [];
    }
    current.push(elem);
  }

  if (current.length > 0) {
    result.push(current);
  }

  return result;
}
