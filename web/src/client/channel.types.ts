import { TagDto } from '@/client/tag.types.ts';
import { PlatformDto, PlatformName } from '@/client/common.schema.ts';

export interface PriorityDto {
  id: string;
  name: string;
  tier: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ChannelDto {
  id: string;
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platform: PlatformDto;
  priority: PriorityDto;
  isFollowed: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagDto[];
}

export interface ChannelAppend {
  pid: string;
  platformName: PlatformName;
  priorityName: string;
  isFollowed: boolean;
  description: string | null;
  tagNames: string[];
}

export interface ChannelUpdate {
  id: string;
  form: {
    priorityName?: string;
    isFollowed?: boolean;
    description?: string | null;
  };
}

export interface ChannelPageResult {
  total: number;
  channels: ChannelDto[];
}
