import { TagRecord } from '@/client/types.tag.ts';
import { ChannelPriority, PlatformType } from '@/client/types.common.ts';

export interface ChannelRecord {
  id: string;
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platform: PlatformType;
  description: string | null;
  priority: ChannelPriority;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}

export interface ChannelRecord {
  id: string;
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platform: PlatformType;
  description: string | null;
  priority: ChannelPriority;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}

export interface ChannelCreation {
  pid: string;
  platform: PlatformType;
  description: string | null;
  priority: ChannelPriority;
  tagNames: string[];
}

export interface ChannelUpdate {
  id: string;
  form: {
    pid?: string;
    platform?: PlatformType;
    description?: string | null;
    priority?: ChannelPriority;
  };
  tagNames?: string[];
}
