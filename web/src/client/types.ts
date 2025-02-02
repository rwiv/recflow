export type PlatformType = 'chzzk' | 'soop' | 'twitch';
export type WebhookType = 'main' | 'sub' | 'extra';
export type ExitCmd = 'delete' | 'cancel' | 'finish';

export interface LiveInfo {
  type: PlatformType;
  channelId: string;
  channelName: string;
  liveId: number;
  liveTitle: string;
  viewCnt: number;
  adult: boolean;
  openDate: string;
}

export interface LiveRecord extends LiveInfo {
  savedAt: string;
  updatedAt: string | undefined;
  deletedAt: string | undefined;
  isDeleted: boolean;
  assignedWebhookName: string;
}

export interface NodeRecord {
  name: string;
  type: WebhookType;
  url: string;
  chzzkCapacity: number;
  soopCapacity: number;
  chzzkAssignedCnt: number;
  soopAssignedCnt: number;
}
