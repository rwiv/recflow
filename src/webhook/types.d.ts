import { LiveInfo } from '../platform/live.js';

export type WebhookType = 'main' | 'sub' | 'extra';
export type WebhookMode = 'mode1' | 'mode2' | 'mode3' | 'mode4';

export interface WebhookDef {
  name: string;
  type: WebhookType;
  url: string;
  chzzkCapacity: number;
  soopCapacity: number;
}

export interface WebhookRecord extends WebhookDef {
  chzzkAssignedCnt: number;
  soopAssignedCnt: number;
}

export interface WebhookMatcher {
  match(live: LiveInfo, webhooks: WebhookRecord[]): WebhookRecord | null;
}
