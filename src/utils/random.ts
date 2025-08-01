import { ValidationError } from './errors/errors/ValidationError.js';

export function randomInt(a: number, b: number): number {
  if (a > b) {
    throw new ValidationError('"a" must be less than or equal to "b"');
  }
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export function arrayElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new ValidationError('Array cannot be empty');
  }
  return array[Math.floor(Math.random() * array.length)];
}
