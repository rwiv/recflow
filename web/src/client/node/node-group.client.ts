import {getIngredients, request} from "@/client/common/common.client.utils.ts";
import {configs} from "@/common/configs.ts";
import {NodeAppend, NodeGroupDto} from "@/client/node/node.schema.ts";

export async function fetchNodeGroups() {
  const res = await request(`${configs.endpoint}/api/nodes/groups`);
  return (await res.json()) as NodeGroupDto[];
}

export async function createNodeGroup(append: NodeAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/nodes/groups`, { method, headers, body });
  return (await res.json()) as NodeGroupDto;
}
