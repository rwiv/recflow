import { configs } from '@/common/configs.ts';
import { TagAttachment, TagDetachment, TagDto, TagUpdate } from '@/client/channel/tag.schema.ts';
import { getIngredients, request } from '@/client/common/common.client.utils.ts';

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

export function updateTagName(id: string, name: string) {
  return updateTag(id, name, undefined);
}

export function updateTagDescription(id: string, description: string | null) {
  return updateTag(id, undefined, description);
}

async function updateTag(id: string, name?: string, description?: string | null) {
  const url = `${configs.endpoint}/api/channels/tags/${id}`;
  const req: TagUpdate = { name, description };
  const { method, headers, body } = getIngredients('PUT', req);
  await request(url, { method, headers, body });
}
