import { configs } from '@shared/config/configs.ts';
import { getIngredients, request } from '@shared/lib/http/http_utils.ts';
import { PlatformName } from '@entities/platform/api/platform.schema.ts';
import { liveDtoWithNodes } from '@entities/live/api/live.mapped.schema.ts';
import { parseList } from '@shared/lib/schema/schema_utils.ts';
import { StreamInfo } from '@entities/live/api/live.schema.ts';
import { ExitCmd } from '@entities/live/model/live_request.shema.ts';

export async function fetchAllLives() {
  const res = await request(`${configs.endpoint}/api/lives/all`);
  return parseList(liveDtoWithNodes, await res.json());
}

export async function createLive(sourceId: string, platform: PlatformName, stream: StreamInfo | null) {
  const url = `${configs.endpoint}/api/lives`;
  const req = { sourceId, platformName: platform, stream };
  const { method, headers, body } = getIngredients('POST', req);
  const res = await request(url, { method, headers, body });
  if (res.status >= 400) {
    throw new Error(`Failed to create live: ${res.status}`);
  }
  return await res.text(); // live id
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
