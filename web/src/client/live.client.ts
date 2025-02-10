import { LiveRecord } from '@/client/live.types.ts';
import { configs } from '@/common/configs.ts';
import { ExitCmd, PlatformType } from '@/common/enum.types.ts';
import { request } from '@/client/utils.ts';

export async function fetchLives() {
  const res = await request(`${configs.endpoint}/api/lives`);
  return (await res.json()) as LiveRecord[];
}

export async function createLive(uid: string, platform: PlatformType) {
  const url = `${configs.endpoint}/api/lives/${platform}/${uid}`;
  const res = await request(url, { method: 'POST' });
  return (await res.json()) as LiveRecord;
}

export async function deleteLive(recordId: string, platform: PlatformType, cmd: ExitCmd) {
  const url = `${configs.endpoint}/api/lives/${platform}/${recordId}?cmd=${cmd}`;
  const res = await request(url, { method: 'DELETE' });
  return (await res.json()) as LiveRecord;
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
