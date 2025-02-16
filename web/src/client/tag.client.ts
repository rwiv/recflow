import { configs } from '@/common/configs.ts';
import { TagAttachment, TagDetachment, TagDto } from '@/client/tag.types.ts';
import { getIngredients, request } from '@/client/utils.ts';

export async function fetchTags() {
  const res = await request(`${configs.endpoint}/api/channels/tags`);
  const tags = (await res.json()) as TagDto[];
  return tags.sort((a, b) => a.name.localeCompare(b.name));
}

export async function attachTag(req: TagAttachment) {
  const url = `${configs.endpoint}/api/channels/tags/attach`;
  const { method, headers, body } = getIngredients('PATCH', req);
  return (await (await request(url, { method, headers, body })).json()) as TagDto;
}

export async function detachTag(req: TagDetachment) {
  const url = `${configs.endpoint}/api/channels/tags/detach`;
  const { method, headers, body } = getIngredients('PATCH', req);
  return request(url, { method, headers, body });
}
