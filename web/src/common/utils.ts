import { TagDto } from '@/client/tag.types.ts';

export function sortedTags(tags: TagDto[]) {
  return tags.sort((a, b) => a.name.localeCompare(b.name));
}
