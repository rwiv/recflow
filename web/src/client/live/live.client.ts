import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/common/common.client.utils.ts';
import { PlatformName } from '@/client/common/platform.schema.ts';
import { ExitCmd } from '@/client/common/common.schema.ts';
import { liveDtoWithNodes } from '@/client/live/live.mapped.schema.ts';
import { parseList } from '@/common/utils.schema.ts';

export async function fetchAllLives() {
  const res = await request(`${configs.endpoint}/api/lives/all`);
  return parseList(liveDtoWithNodes, await res.json());
}

export async function createLive(pid: string, platform: PlatformName) {
  const url = `${configs.endpoint}/api/lives`;
  const req = { pid, platformName: platform };
  const { method, headers, body } = getIngredients('POST', req);
  const res = await request(url, { method, headers, body });
  return liveDtoWithNodes.parse(await res.json());
}

export async function deleteLive(recordId: string, cmd: ExitCmd, isPurge: boolean) {
  const url = `${configs.endpoint}/api/lives`;
  const req = { recordId, cmd, isPurge };
  const { method, headers, body } = getIngredients('DELETE', req);
  await request(url, { method, headers, body });
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
