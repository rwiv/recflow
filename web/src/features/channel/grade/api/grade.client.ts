import { configs } from '@/shared/config/configs.ts';
import { getIngredients, request } from '@/shared/lib/http/http_utils.ts';

import { GradeAppend, GradeDto, GradeUpdate } from '@/entities/channel/grade/model/grade.schema.ts';

export async function fetchGrades() {
  const res = await request(`${configs.endpoint}/api/channels/grades`);
  const grades = (await res.json()) as GradeDto[];
  return grades.sort((a, b) => a.seq - b.seq);
}

export async function createGrade(append: GradeAppend) {
  const { method, headers, body } = getIngredients('POST', append);
  const res = await request(`${configs.endpoint}/api/channels/grades`, { method, headers, body });
  return (await res.json()) as GradeDto;
}

export async function deleteGrade(gradeId: string) {
  await request(`${configs.endpoint}/api/channels/grades/${gradeId}`, { method: 'DELETE' });
}

export async function updateGrade(id: string, req: GradeUpdate) {
  const url = `${configs.endpoint}/api/channels/grades/${id}`;
  const { method, headers, body } = getIngredients('PUT', req);
  await request(url, { method, headers, body });
}
