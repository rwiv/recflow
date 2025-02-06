import { configs } from '@/common/configs.ts';
import { NodeRecord } from '@/client/node.types.ts';
import { request } from '@/client/utils.ts';

export async function fetchNodes() {
  const res = await request(`${configs.endpoint}/api/lives/nodes`);
  return (await res.json()) as NodeRecord[];
}
