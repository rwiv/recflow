import { TagRecord } from '@/client/tag.types.ts';
import { ChannelPriority, PlatformType } from '@/common/types.ts';

export interface ChannelRecord {
  id: string;
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platform: PlatformType;
  priority: ChannelPriority;
  followed: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}

export interface ChannelCreation {
  pid: string;
  platform: PlatformType;
  priority: ChannelPriority;
  followed: boolean;
  description: string | null;
  tagNames: string[];
}

export interface ChannelDefUpdate {
  id: string;
  form: {
    priority?: ChannelPriority;
    followed?: boolean;
    description?: string | null;
  };
}
