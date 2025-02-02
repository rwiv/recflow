import { ExitCmd, PlatformType, LiveRecord, NodeRecord } from '@/client/types.ts';
import { configs } from '@/common/configs.ts';

export async function fetchNodes() {
  const res = await fetch(`${configs.endpoint}/api/lives/nodes`);
  return (await res.json()) as NodeRecord[];
}

export async function fetchLives() {
  const res = await fetch(`${configs.endpoint}/api/lives`);
  return (await res.json()) as LiveRecord[];
}

export async function createLive(uid: string, ptype: PlatformType) {
  const url = `${configs.endpoint}/api/lives/${ptype}/${uid}`;
  const res = await fetch(url, { method: 'POST' });
  return (await res.json()) as LiveRecord;
}

export async function deleteLive(uid: string, ptype: PlatformType, cmd: ExitCmd) {
  const url = `${configs.endpoint}/api/lives/${ptype}/${uid}?cmd=${cmd}`;
  const res = await fetch(url, { method: 'DELETE' });
  return (await res.json()) as LiveRecord;
}
