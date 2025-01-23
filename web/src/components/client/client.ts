import {
  ExitCmd,
  LiveInfo,
  PlatformType,
  WebhookState,
} from '@/components/client/types.ts';

export class Client {
  constructor(private readonly baseUrl: string) {}

  async getWebhooks() {
    const res = await fetch(`${this.baseUrl}/api/webhooks`);
    return (await res.json()) as WebhookState[];
  }

  async getLive() {
    const res = await fetch(`${this.baseUrl}/api/lives`);
    return (await res.json()) as LiveInfo[];
  }

  async createLive(uid: string, type: PlatformType) {
    const url = `${this.baseUrl}/${type}/${uid}`;
    const res = await fetch(url, { method: 'POST' });
    return (await res.json()) as LiveInfo;
  }

  async deleteLive(uid: string, type: PlatformType, cmd: ExitCmd) {
    const url = `${this.baseUrl}/${type}/${uid}?cmd=${cmd}`;
    const res = await fetch(url, { method: 'DELETE' });
    return (await res.json()) as LiveInfo;
  }
}
