import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { parseList } from '@/common/utils.schema.ts';
import { TaskInfo, taskInfo } from '@/client/task/task.schema.ts';

const BASE_URL = `${configs.endpoint}/api/tasks`;

export async function fetchTasks(): Promise<TaskInfo[]> {
  const res = await request(BASE_URL);
  return parseList(taskInfo, await res.json());
}

export async function startAllocationTask() {
  const { method, headers, body } = getIngredients('POST');
  await request(`${BASE_URL}/lives/allocation/start`, { method, headers, body });
}

export async function stopAllocationTask() {
  const { method, headers, body } = getIngredients('POST');
  await request(`${BASE_URL}/lives/allocation/stop`, { method, headers, body });
}
