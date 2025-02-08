import { ParsingError } from './errors/errors/ParsingError.js';

export function parseInteger(
  value: string | undefined,
  name: string | undefined = undefined,
): number {
  let nameField = '';
  if (name) {
    nameField = `${name}=`;
  }

  if (value === undefined) {
    throw new ParsingError(`Missing integer: ${nameField}`);
  }

  const num = parseInt(value);
  if (isNaN(num)) {
    throw new ParsingError(`Invalid integer: ${nameField}=${value}`);
  }
  return num;
}
