import { ZodType } from 'zod';

export function parseList<T>(zod: ZodType<T>, list: T[]) {
  return list.map((item) => zod.parse(item));
}
