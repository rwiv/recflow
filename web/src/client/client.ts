import { ExitCmd, LiveInfo, PlatformType, WebhookState } from '@/client/types.ts';
import { configs } from '@/common/configs.ts';

export async function fetchWebhooks() {
  const res = await fetch(`${configs.endpoint}/api/webhooks`);
  return (await res.json()) as WebhookState[];
}

export async function fetchLives() {
  const res = await fetch(`${configs.endpoint}/api/lives`);
  return (await res.json()) as LiveInfo[];
}

export async function createLive(uid: string, ptype: PlatformType) {
  const url = `${configs.endpoint}/api/${ptype}/${uid}`;
  const res = await fetch(url, { method: 'POST' });
  return (await res.json()) as LiveInfo;
}

export async function deleteLive(uid: string, ptype: PlatformType, cmd: ExitCmd) {
  const url = `${configs.endpoint}/api/${ptype}/${uid}?cmd=${cmd}`;
  const res = await fetch(url, { method: 'DELETE' });
  return (await res.json()) as LiveInfo;
}
