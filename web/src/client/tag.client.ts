import { configs } from '@/common/configs.ts';
import { TagEntUpdate, TagRecord } from '@/client/tag.types.ts';
import { getIngredients } from '@/client/utils.ts';

export async function fetchTags() {
  const res = await fetch(`${configs.endpoint}/api/channels/tags`);
  return (await res.json()) as TagRecord[];
}

export async function updateTag(req: TagEntUpdate) {
  const url = `${configs.endpoint}/api/tags`;
  const { method, headers, body } = getIngredients('PUT', req);
  return (await (await fetch(url, { method, headers, body })).json()) as TagRecord;
}
