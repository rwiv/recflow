import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/utils.ts';
import { NodeAppend, NodeGroupDto, NodeDto, NodeUpdate, nodeDto } from '@/client/node.schema.ts';
import { parseList } from '@/common/utils.ts';

export async function fetchNodes() {
  const res = await request(`${configs.endpoint}/api/nodes`);
  const nodes = parseList(nodeDto, await res.json());
  return nodes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchNodeGroups() {
  const res = await request(`${configs.endpoint}/api/nodes/groups`);
  return (await res.json()) as NodeGroupDto[];
}

export async function createNode(append: NodeAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/nodes`, { method, headers, body });
  return (await res.json()) as NodeDto;
}

export function updateNodeIsCordoned(id: string, isCordoned: boolean) {
  return updateNode(id, undefined, undefined, undefined, undefined, isCordoned, undefined);
}

export function updateNodeGroup(id: string, groupId: string) {
  return updateNode(id, undefined, undefined, undefined, undefined, undefined, groupId);
}

async function updateNode(
  id: string,
  name?: string,
  endpoint?: string,
  weight?: number,
  totalCapacity?: number,
  isCordoned?: boolean,
  groupId?: string,
) {
  const url = `${configs.endpoint}/api/nodes/${id}`;
  const req: NodeUpdate = { name, endpoint, weight, totalCapacity, isCordoned, groupId };
  const { method, headers, body } = getIngredients('PUT', req);
  await request(url, { method, headers, body });
}

export async function deleteNode(nodeId: string) {
  await request(`${configs.endpoint}/api/nodes/${nodeId}`, { method: 'DELETE' });
}
