import { ParsingError } from './errors/errors/ParsingError.js';

export function parseInteger(value: string) {
  const num = parseInt(value);
  if (isNaN(num)) {
    throw new ParsingError(`Invalid integer: ${value}`);
  }
  return num;
}
