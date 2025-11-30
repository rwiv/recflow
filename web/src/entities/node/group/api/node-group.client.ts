import { configs } from '@/shared/config/configs.ts';
import { getIngredients, request } from '@/shared/lib/http/http_utils.ts';

import {
  NodeGroupAppend,
  NodeGroupDto,
  NodeGroupUpdate,
} from '@/entities/node/group/api/node-group.schema.ts';

export async function fetchNodeGroups() {
  const res = await request(`${configs.endpoint}/api/node-groups`);
  const nodeGroups = (await res.json()) as NodeGroupDto[];
  return nodeGroups.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createNodeGroup(append: NodeGroupAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/node-groups`, { method, headers, body });
  return (await res.json()) as NodeGroupDto;
}

export async function drainNodeGroup(groupId: string) {
  const { method, headers, body } = getIngredients('POST', { groupId });
  await request(`${configs.endpoint}/api/lives/drain`, {
    method,
    headers,
    body,
  });
}

export async function deleteNodeGroup(nodeGroupId: string) {
  await request(`${configs.endpoint}/api/node-groups/${nodeGroupId}`, { method: 'DELETE' });
}

export async function updateNodeGroupName(id: string, name: string) {
  return updateTag(id, name, undefined);
}

export function updateNodeGroupDescription(id: string, description: string | null) {
  return updateTag(id, undefined, description);
}

async function updateTag(id: string, name?: string, description?: string | null) {
  const url = `${configs.endpoint}/api/node-groups/${id}`;
  const req: NodeGroupUpdate = { name, description };
  const { method, headers, body } = getIngredients('PUT', req);
  await request(url, { method, headers, body });
}
