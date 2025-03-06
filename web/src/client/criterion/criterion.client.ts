import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { configs } from '@/common/configs.ts';
import {
  ChzzkCriterionAppend,
  chzzkCriterionDto,
  ChzzkCriterionDto,
  CriterionUpdate,
  SoopCriterionAppend,
  soopCriterionDto,
  SoopCriterionDto,
} from '@/client/criterion/criterion.schema.ts';
import { parseList } from '@/common/utils.schema.ts';

export async function fetchChzzkCriteria() {
  const res = await request(`${configs.endpoint}/api/criteria/chzzk`);
  const criteria = parseList(chzzkCriterionDto, await res.json());
  return criteria.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function fetchSoopCriteria() {
  const res = await request(`${configs.endpoint}/api/criteria/soop`);
  const criteria = parseList(soopCriterionDto, await res.json());
  return criteria.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
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

export function updateCriterionEnforceCreds(id: string, enforceCreds: boolean) {
  return updateCriterion(id, undefined, enforceCreds);
}

export function updateCriterionIsDeactivated(id: string, isDeactivated: boolean) {
  return updateCriterion(id, undefined, undefined, isDeactivated);
}

export function updateCriterionMinUserCnt(id: string, minUserCnt: number) {
  return updateCriterion(id, undefined, undefined, undefined, minUserCnt);
}

export function updateCriterionMinFollowCnt(id: string, minFollowCnt: number) {
  return updateCriterion(id, undefined, undefined, undefined, undefined, minFollowCnt);
}

async function updateCriterion(
  id: string,
  description?: string | null,
  enforceCreds?: boolean,
  isDeactivated?: boolean,
  minUserCnt?: number,
  minFollowCnt?: number,
) {
  const url = `${configs.endpoint}/api/criteria/${id}`;
  const req: CriterionUpdate = { description, enforceCreds, isDeactivated, minUserCnt, minFollowCnt };
  const { method, headers, body } = getIngredients('PUT', req);
  await request(url, { method, headers, body });
}

export async function deleteCriterion(criterionId: string) {
  await request(`${configs.endpoint}/api/criteria/${criterionId}`, { method: 'DELETE' });
}
