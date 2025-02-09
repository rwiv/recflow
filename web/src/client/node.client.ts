import { configs } from '@/common/configs.ts';
import { request } from '@/client/utils.ts';
import { NodeGroup, NodeRecord } from '@/client/node.schema.ts';

export async function fetchNodes() {
  const res = await request(`${configs.endpoint}/api/nodes`);
  return (await res.json()) as NodeRecord[];
}

export async function fetchNodeGroups() {
  const res = await request(`${configs.endpoint}/api/nodes/groups`);
  return (await res.json()) as NodeGroup[];
}
