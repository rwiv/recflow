import { ValidationError } from './errors/errors/ValidationError.js';

export function randomInt(a: number, b: number): number {
  if (a > b) {
    throw new ValidationError('"a" must be less than or equal to "b"');
  }
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
