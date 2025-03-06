import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { configs } from '@/common/configs.ts';
import { PriorityAppend, PriorityDto } from '@/client/channel/channel.types.ts';

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
