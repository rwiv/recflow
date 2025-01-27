export type PlatformType = 'chzzk' | 'soop' | 'twitch';
export type WebhookType = 'main' | 'sub' | 'extra';
export type ExitCmd = 'delete' | 'cancel';

export interface LiveInfo {
  type: PlatformType;
  channelId: string;
  channelName: string;
  liveTitle: string;
  viewCnt: number;
  adult: boolean;
  assignedWebhookName: string;
}

export interface WebhookState {
  name: string;
  type: WebhookType;
  url: string;
  chzzkCapacity: number;
  soopCapacity: number;
  chzzkAssignedCnt: number;
  soopAssignedCnt: number;
}
