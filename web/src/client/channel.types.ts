import { TagRecord } from '@/client/tag.types.ts';
import { ChannelPriority, PlatformType } from '@/common/enum.types.ts';

export interface ChannelRecord {
  id: string;
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platformName: PlatformType;
  priorityName: ChannelPriority;
  followed: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}

export interface ChannelCreation {
  pid: string;
  platformName: PlatformType;
  priorityName: ChannelPriority;
  followed: boolean;
  description: string | null;
  tagNames: string[];
}

export interface ChannelDefUpdate {
  id: string;
  form: {
    priorityName?: ChannelPriority;
    followed?: boolean;
    description?: string | null;
  };
}

export interface PageResult {
  total: number;
  channels: ChannelRecord[];
}
