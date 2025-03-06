import { TagDto } from '@/client/channel/tag.types.ts';
import { PlatformDto } from '@/client/common/platform.schema.ts';
import { z } from 'zod';
import { uuid } from '@/common/common.schema.ts';

export const priorityDto = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  tier: z.number().int().positive(),
  seq: z.number().int().nonnegative(),
  shouldNotify: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type PriorityDto = z.infer<typeof priorityDto>;

export const priorityAppend = priorityDto.partial({
  id: true,
  description: true,
  shouldNotify: true,
  createdAt: true,
  updatedAt: true,
});
export type PriorityAppend = z.infer<typeof priorityAppend>;

export const priorityUpdate = priorityDto.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type PriorityUpdate = z.infer<typeof priorityUpdate>;

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
  platformId: string;
  priorityId: string;
  isFollowed: boolean;
  description: string | null;
  tagNames: string[];
}

export interface ChannelUpdate {
  priorityId?: string;
  isFollowed?: boolean;
  description?: string | null;
}

export interface ChannelPageResult {
  total: number;
  channels: ChannelDto[];
}
