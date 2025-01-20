import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {SoopLiveInfo} from "../client/types_soop.js";
import {ChzzkWebhookState, SoopWebhookState} from "../webhook/types.js";

export interface ChzzkTargetRepository {
  set(id: string, info: ChzzkLiveInfo, wh: ChzzkWebhookState): Promise<ChzzkLiveState>;
  get(id: string): Promise<ChzzkLiveState | undefined>;
  delete(id: string): Promise<ChzzkLiveState>;
  all(): Promise<ChzzkLiveState[]>;
  whStates(): Promise<ChzzkWebhookState[]>;
}

export interface SoopTargetRepository {
  set(id: string, info: SoopLiveInfo, wh: SoopWebhookState): Promise<void>;
  get(id: string): Promise<SoopLiveInfo | undefined>;
  delete(id: string): Promise<void>;
  all(): Promise<SoopLiveInfo[]>;
  whStates(): Promise<SoopWebhookState[]>;
}

export interface ChzzkLiveState extends ChzzkLiveInfo {
  assignedWebhookName: string;
}

export interface SoopLiveState extends SoopLiveInfo {
  assignedWebhookName: string;
}
