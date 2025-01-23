export type PlatformType = 'chzzk' | 'soop';

export interface LiveInfo {
  type: PlatformType;
  channelId: string;
  channelName: string;
  liveTitle: string;
  viewCnt: number;
  adult: boolean;
  assignedWebhookName: string;
}
