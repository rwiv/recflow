import { ParsingError } from './errors/errors/ParsingError.js';

export function parseInteger(
  value: string | undefined,
  name: string | undefined = undefined,
  defaultValue: number | undefined = undefined,
): number {
  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    } else {
      throw new ParsingError(`Missing integer: ${name}=${value}`);
    }
  }

  const num = parseInt(value);
  if (isNaN(num)) {
    throw new ParsingError(`Invalid integer: ${name}=${value}`);
  }
  return num;
}
