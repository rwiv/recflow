import { getIngredients, request } from '@/client/utils.ts';
import { configs } from '@/common/configs.ts';
import {
  ChzzkCriterionAppend,
  ChzzkCriterionDto,
  SoopCriterionAppend,
  SoopCriterionDto,
} from '@/client/criterion.schema.ts';

export async function fetchChzzkCriteria() {
  const res = await request(`${configs.endpoint}/api/criteria/chzzk`);
  return (await res.json()) as ChzzkCriterionDto[];
}

export async function fetchSoopCriteria() {
  const res = await request(`${configs.endpoint}/api/criteria/soop`);
  return (await res.json()) as SoopCriterionDto[];
}

export async function createChzzkCriterion(append: ChzzkCriterionAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/criteria/chzzk`, { method, headers, body });
  return (await res.json()) as ChzzkCriterionDto;
}

export async function createSoopCriterion(append: SoopCriterionAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/criteria/soop`, { method, headers, body });
  return (await res.json()) as SoopCriterionDto;
}

export async function deleteCriterion(criterionId: string) {
  await request(`${configs.endpoint}/api/criteria/${criterionId}`, { method: 'DELETE' });
}
