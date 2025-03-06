import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { configs } from '@/common/configs.ts';
import { PriorityAppend, PriorityDto, PriorityUpdate } from '@/client/channel/channel.types.ts';

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

export function updatePriorityName(id: string, name: string) {
  return updatePriority(id, name, undefined, undefined, undefined, undefined);
}

export function updatePriorityDescription(id: string, description: string | null) {
  if (description === '') {
    description = null;
  }
  return updatePriority(id, undefined, description, undefined, undefined, undefined);
}

export function updatePriorityTier(id: string, tier: number) {
  return updatePriority(id, undefined, undefined, tier, undefined, undefined);
}

export function updatePrioritySeq(id: string, seq: number) {
  return updatePriority(id, undefined, undefined, undefined, seq, undefined);
}

export function updatePriorityShouldNotify(id: string, shouldNotify: boolean) {
  return updatePriority(id, undefined, undefined, undefined, undefined, shouldNotify);
}

async function updatePriority(
  id: string,
  name?: string,
  description?: string | null,
  tier?: number,
  seq?: number,
  shouldNotify?: boolean,
) {
  const url = `${configs.endpoint}/api/channels/priorities/${id}`;
  const req: PriorityUpdate = { name, description, tier, seq, shouldNotify };
  const { method, headers, body } = getIngredients('PUT', req);
  await request(url, { method, headers, body });
}
