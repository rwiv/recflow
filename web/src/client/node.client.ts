import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/utils.ts';
import { NodeAppend, NodeGroup, NodeRecord } from '@/client/node.schema.ts';

export async function fetchNodes() {
  const res = await request(`${configs.endpoint}/api/nodes`);
  return (await res.json()) as NodeRecord[];
}

export async function fetchNodeGroups() {
  const res = await request(`${configs.endpoint}/api/nodes/groups`);
  return (await res.json()) as NodeGroup[];
}

export async function createNode(append: NodeAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/nodes`, {
    method,
    headers,
    body,
  });
  return (await res.json()) as NodeRecord;
}
