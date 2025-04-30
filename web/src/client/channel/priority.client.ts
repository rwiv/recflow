import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { configs } from '@/common/configs.ts';
import { PriorityAppend, PriorityDto, PriorityUpdate } from '@/client/channel/priority.schema.ts';

export async function fetchPriorities() {
  const res = await request(`${configs.endpoint}/api/channels/priorities`);
  const priorities = (await res.json()) as PriorityDto[];
  return priorities.sort((a, b) => a.seq - b.seq);
}

export async function createPriority(append: PriorityAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/channels/priorities`, { method, headers, body });
  return (await res.json()) as PriorityDto;
}

export async function deletePriority(PriorityId: string) {
  await request(`${configs.endpoint}/api/channels/priorities/${PriorityId}`, { method: 'DELETE' });
}

export async function updatePriority(id: string, req: PriorityUpdate) {
  const url = `${configs.endpoint}/api/channels/priorities/${id}`;
  const { method, headers, body } = getIngredients('PUT', req);
  await request(url, { method, headers, body });
}
