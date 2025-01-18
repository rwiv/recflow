import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {SoopLiveInfo} from "../client/types_soop.js";

export type WebhookType = "main" | "sub" | "extra";

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

export interface ChzzkWebhookAllocator {
  allocate(live: ChzzkLiveInfo, whStates: WebhookState[]): WebhookState | null;
}

export interface SoopWebhookAllocator {
  allocate(live: SoopLiveInfo, whStates: WebhookState[]): WebhookState | null;
}
