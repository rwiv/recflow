import { NodeAppend, NodeDto } from '@/client/node.schema.ts';
import { getIngredients, request } from '@/client/utils.ts';
import { configs } from '@/common/configs.ts';

export async function createCriterion(append: NodeAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/criteria`, { method, headers, body });
  return (await res.json()) as NodeDto;
}

export async function deleteCriterion(criterionId: string) {
  await request(`${configs.endpoint}/api/criteria/${criterionId}`, { method: 'DELETE' });
}
