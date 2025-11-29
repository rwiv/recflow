import { configs } from '@shared/config';
import { getIngredients, request } from '@shared/lib/http';
import { NodeAppend, nodeDto, NodeUpdate } from '@entities/node/node/api/node.schema.ts';
import { parseList } from '@shared/lib/schema/schema_utils.ts';

export async function fetchNodes() {
  const res = await request(`${configs.endpoint}/api/nodes`);
  const nodes = parseList(nodeDto, await res.json());
  return nodes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createNode(append: NodeAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/nodes`, { method, headers, body });
  return nodeDto.parse(await res.json());
}

export async function updateNode(id: string, form: NodeUpdate) {
  const url = `${configs.endpoint}/api/nodes/${id}`;
  const { method, headers, body } = getIngredients('PUT', form);
  await request(url, { method, headers, body });
}

export async function deleteNode(nodeId: string) {
  await request(`${configs.endpoint}/api/nodes/${nodeId}`, { method: 'DELETE' });
}
