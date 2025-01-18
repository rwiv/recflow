import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {SoopLiveInfo} from "../client/types_soop.js";
import {ChzzkWebhookState} from "../webhook/types.js";

export interface ChzzkTargetRepository {
  set(id: string, info: ChzzkLiveInfo, wh: ChzzkWebhookState): Promise<void>;
  get(id: string): Promise<ChzzkLiveState | undefined>;
  delete(id: string): Promise<void>;
  all(): Promise<ChzzkLiveState[]>;
  whStates(): Promise<ChzzkWebhookState[]>;
}

export interface SoopTargetRepository {
  set(id: string, info: SoopLiveInfo): Promise<void>;
  get(id: string): Promise<SoopLiveInfo | undefined>;
  delete(id: string): Promise<void>;
  all(): Promise<SoopLiveInfo[]>;
}

export interface ChzzkLiveState extends ChzzkLiveInfo {
  assignedWebhookName: string;
}
