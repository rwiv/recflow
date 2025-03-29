import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { NodeAppend, NodeDto, NodeUpdate, nodeDto } from '@/client/node/node.schema.ts';
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

export async function updateNode(id: string, form: NodeUpdate) {
  const url = `${configs.endpoint}/api/nodes/${id}`;
  const { method, headers, body } = getIngredients('PUT', form);
  await request(url, { method, headers, body });
}

export async function deleteNode(nodeId: string) {
  await request(`${configs.endpoint}/api/nodes/${nodeId}`, { method: 'DELETE' });
}
