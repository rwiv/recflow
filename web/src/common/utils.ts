import { TagDto } from '@/client/tag.types.ts';

export function sortedTags(tags: TagDto[]) {
  return tags.sort((a, b) => a.name.localeCompare(b.name));
}

export function firstLetterUppercase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
