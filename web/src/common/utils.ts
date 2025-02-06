import { TagRecord } from '@/client/tag.types.ts';

export function sortedTags(tags: TagRecord[]) {
  return tags.sort((a, b) => a.name.localeCompare(b.name));
}
