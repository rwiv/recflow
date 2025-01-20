import { WebhookState } from '../webhook/types.js';
import { LiveInfo } from '../platform/wrapper.live.js';

export interface TargetRepository {
  set(id: string, info: LiveInfo, wh: WebhookState): Promise<LiveInfo>;
  get(id: string): Promise<LiveInfo | undefined>;
  delete(id: string): Promise<LiveInfo>;
  all(): Promise<LiveInfo[]>;
  allChzzk(): Promise<LiveInfo[]>;
  allSoop(): Promise<LiveInfo[]>;
  whStates(): Promise<WebhookState[]>;
}
