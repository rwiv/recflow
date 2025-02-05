import { configs } from '@/common/configs.ts';
import { TagEntAttachment, TagEntDetachment, TagEntUpdate, TagRecord } from '@/client/tag.types.ts';
import { getIngredients } from '@/client/utils.ts';

export async function fetchTags() {
  const res = await fetch(`${configs.endpoint}/api/channels/tags`);
  return (await res.json()) as TagRecord[];
}

export async function updateTag(req: TagEntUpdate) {
  const url = `${configs.endpoint}/api/channels/tags`;
  const { method, headers, body } = getIngredients('PUT', req);
  return (await (await fetch(url, { method, headers, body })).json()) as TagRecord;
}

export async function attachTag(req: TagEntAttachment) {
  const url = `${configs.endpoint}/api/channels/tags/attach`;
  const { method, headers, body } = getIngredients('PATCH', req);
  return (await (await fetch(url, { method, headers, body })).json()) as TagRecord;
}

export async function detachTag(req: TagEntDetachment) {
  const url = `${configs.endpoint}/api/channels/tags/detach`;
  const { method, headers, body } = getIngredients('PATCH', req);
  return (await (await fetch(url, { method, headers, body })).json()) as TagRecord;
}
