import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { NodeAppend, NodeDto, NodeUpdate, nodeDto, NodeCapacity } from '@/client/node/node.schema.ts';
import { parseList } from '@/common/utils.schema.ts';

export async function fetchNodes() {
  const res = await request(`${configs.endpoint}/api/nodes`);
  const nodes = parseList(nodeDto, await res.json());
  return nodes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createNode(append: NodeAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/nodes`, { method, headers, body });
  return (await res.json()) as NodeDto;
}

export function updateNodeName(id: string, name: string) {
  return updateNode(id, name, undefined, undefined, undefined, undefined, undefined, undefined);
}

export function updateNodeEndpoint(id: string, endpoint: string) {
  return updateNode(id, undefined, endpoint, undefined, undefined, undefined, undefined, undefined);
}

export function updateNodeNodeGroup(id: string, groupId: string) {
  return updateNode(id, undefined, undefined, undefined, undefined, undefined, groupId, undefined);
}

export function updateNodeWeight(id: string, weight: number) {
  return updateNode(id, undefined, undefined, weight, undefined, undefined, undefined, undefined);
}

export function updateNodeTotalCapacity(id: string, totalCapacity: number) {
  return updateNode(id, undefined, undefined, undefined, totalCapacity, undefined, undefined, undefined);
}

export function updateNodeCapacity(id: string, capacity: NodeCapacity) {
  return updateNode(id, undefined, undefined, undefined, undefined, undefined, undefined, capacity);
}

export function updateNodeIsCordoned(id: string, isCordoned: boolean) {
  return updateNode(id, undefined, undefined, undefined, undefined, isCordoned, undefined, undefined);
}

async function updateNode(
  id: string,
  name?: string,
  endpoint?: string,
  weight?: number,
  totalCapacity?: number,
  isCordoned?: boolean,
  groupId?: string,
  capacity?: NodeCapacity,
) {
  const url = `${configs.endpoint}/api/nodes/${id}`;
  const req: NodeUpdate = { name, endpoint, weight, totalCapacity, isCordoned, groupId, capacity };
  const { method, headers, body } = getIngredients('PUT', req);
  await request(url, { method, headers, body });
}

export async function deleteNode(nodeId: string) {
  await request(`${configs.endpoint}/api/nodes/${nodeId}`, { method: 'DELETE' });
}
