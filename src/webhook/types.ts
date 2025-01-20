import { ChzzkLiveInfo } from '../client/types.chzzk.js';
import { SoopLiveInfo } from '../client/types.soop.js';

export type WebhookType = 'main' | 'sub' | 'extra';
export type WebhookMode = 'mode1' | 'mode2' | 'mode3' | 'mode4';

export interface WebhookInfo {
  name: string;
  type: WebhookType;
  url: string;
  chzzkCapacity: number;
  soopCapacity: number;
}

export interface ChzzkWebhookState extends WebhookInfo {
  chzzkAssignedCnt: number;
}

export interface SoopWebhookState extends WebhookInfo {
  soopAssignedCnt: number;
}

export interface ChzzkWebhookMatcher {
  match(
    live: ChzzkLiveInfo,
    whStates: ChzzkWebhookState[],
  ): ChzzkWebhookState | null;
}

export interface SoopWebhookMatcher {
  match(
    live: SoopLiveInfo,
    whStates: SoopWebhookState[],
  ): SoopWebhookState | null;
}
