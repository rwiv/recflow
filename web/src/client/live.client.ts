import { LiveRecord } from '@/client/live.types.ts';
import { configs } from '@/common/configs.ts';
import { ExitCmd, PlatformType } from '@/common/types.ts';

export async function fetchLives() {
  const res = await fetch(`${configs.endpoint}/api/lives`);
  return (await res.json()) as LiveRecord[];
}

export async function createLive(uid: string, platform: PlatformType) {
  const url = `${configs.endpoint}/api/lives/${platform}/${uid}`;
  const res = await fetch(url, { method: 'POST' });
  return (await res.json()) as LiveRecord;
}

export async function deleteLive(uid: string, platform: PlatformType, cmd: ExitCmd) {
  const url = `${configs.endpoint}/api/lives/${platform}/${uid}?cmd=${cmd}`;
  const res = await fetch(url, { method: 'DELETE' });
  return (await res.json()) as LiveRecord;
}
