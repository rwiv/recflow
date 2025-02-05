import { PlatformType } from '@/common/types.ts';

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
