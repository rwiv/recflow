import { TagDto } from '@/client/tag.types.ts';
import { ZodType } from 'zod';

export function sortedTags(tags: TagDto[]) {
  return tags.sort((a, b) => a.name.localeCompare(b.name));
}

export function firstLetterUppercase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function parseList<T>(zod: ZodType<T>, list: T[]) {
  return list.map((item) => zod.parse(item));
}
