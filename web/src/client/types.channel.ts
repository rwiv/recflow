import { TagRecord } from '@/client/types.tag.ts';
import { ChannelPriority, PlatformType } from '@/client/types.common.ts';

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

export interface ChannelCreation {
  ptype: PlatformType;
  pid: string;
  description: string | null;
  priority: ChannelPriority;
  tagNames: string[];
}

export interface ChannelUpdate {
  id: string;
  form: {
    ptype?: PlatformType;
    pid?: string;
    description?: string | null;
    priority?: ChannelPriority;
  };
  tagNames?: string[];
}
