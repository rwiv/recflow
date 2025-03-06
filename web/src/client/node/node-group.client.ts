import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { configs } from '@/common/configs.ts';
import { NodeGroupAppend, NodeGroupDto } from '@/client/node/node.schema.ts';

export async function fetchNodeGroups() {
  const res = await request(`${configs.endpoint}/api/nodes/groups`);
  return (await res.json()) as NodeGroupDto[];
}

export async function createNodeGroup(append: NodeGroupAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/nodes/groups`, { method, headers, body });
  return (await res.json()) as NodeGroupDto;
}

export async function deleteNodeGroup(nodeGroupId: string) {
  await request(`${configs.endpoint}/api/nodes/groups/${nodeGroupId}`, { method: 'DELETE' });
}
