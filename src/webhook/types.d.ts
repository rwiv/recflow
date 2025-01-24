import { LiveInfo } from '../platform/live.wrapper.js';

export type WebhookType = 'main' | 'sub' | 'extra';
export type WebhookMode = 'mode1' | 'mode2' | 'mode3' | 'mode4';

export interface WebhookInfo {
  name: string;
  type: WebhookType;
  url: string;
  chzzkCapacity: number;
  soopCapacity: number;
}

export interface WebhookState extends WebhookInfo {
  chzzkAssignedCnt: number;
  soopAssignedCnt: number;
}

export interface WebhookMatcher {
  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null;
}

export interface ChzzkWebhookMatcher extends WebhookMatcher {
  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null;
}

export interface SoopWebhookMatcher extends WebhookMatcher {
  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null;
}
