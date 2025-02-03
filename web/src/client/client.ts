import {
  ExitCmd,
  PlatformType,
  LiveRecord,
  NodeRecord,
  ChannelRecord,
  TagRecord,
} from '@/client/types.ts';
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

export async function fetchChannels(page: number, size: number = 10, withTags = true) {
  const qs = `?p=${page}&s=${size}&wt=${withTags}`;
  const res = await fetch(`${configs.endpoint}/api/channels${qs}`);
  return (await res.json()) as ChannelRecord[];
}

export async function fetchTags() {
  const res = await fetch(`${configs.endpoint}/api/channels/tags`);
  return (await res.json()) as TagRecord[];
}
