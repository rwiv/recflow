import { LiveDto } from '@/client/live.types.ts';
import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/utils.ts';
import { ExitCmd, PlatformName } from '@/client/common.schema.ts';

export async function fetchLives() {
  const res = await request(`${configs.endpoint}/api/lives`);
  return (await res.json()) as LiveDto[];
}

export async function createLive(pid: string, platform: PlatformName) {
  const url = `${configs.endpoint}/api/lives`;
  const req = { pid, platformName: platform };
  const { method, headers, body } = getIngredients('POST', req);
  const res = await request(url, { method, headers, body });
  return (await res.json()) as LiveDto;
}

export async function deleteLive(recordId: string, cmd: ExitCmd) {
  const url = `${configs.endpoint}/api/lives`;
  const req = { recordId, cmd };
  const { method, headers, body } = getIngredients('DELETE', req);
  const res = await request(url, { method, headers, body });
  return (await res.json()) as LiveDto;
}

export async function isScheduled() {
  const res = await request(`${configs.endpoint}/api/lives/schedule/stat`);
  return (await res.json()) as { status: boolean };
}

export async function startSchedule() {
  const url = `${configs.endpoint}/api/lives/schedule/start`;
  await request(url, { method: 'POST' });
}

export async function stopSchedule() {
  const url = `${configs.endpoint}/api/lives/schedule/stop`;
  await request(url, { method: 'POST' });
}
