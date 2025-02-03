export type PlatformType = 'chzzk' | 'soop' | 'twitch';
export type WebhookType = 'main' | 'sub' | 'extra';
export type ExitCmd = 'delete' | 'cancel' | 'finish';
export type ChannelPriority = 'must' | 'should' | 'may' | 'review' | 'skip' | 'none';

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

export interface ChannelRecord {
  id: string;
  ptype: PlatformType;
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  description: string | null;
  priority: ChannelPriority;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}

export interface TagRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
