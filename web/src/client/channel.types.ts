import { TagRecord } from '@/client/tag.types.ts';
import { PlatformType } from '@/common/enum.types.ts';
import { PlatformRecord } from '@/client/common.schema.ts';

export interface ChannelPriorityRecord {
  id: string;
  name: string;
  tier: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ChannelRecord {
  id: string;
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platform: PlatformRecord;
  priority: ChannelPriorityRecord;
  followed: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}

export interface ChannelCreation {
  pid: string;
  platformName: PlatformType;
  priorityName: string;
  followed: boolean;
  description: string | null;
  tagNames: string[];
}

export interface ChannelDefUpdate {
  id: string;
  form: {
    priorityName?: string;
    followed?: boolean;
    description?: string | null;
  };
}

export interface PageResult {
  total: number;
  channels: ChannelRecord[];
}
