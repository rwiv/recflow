import { TagRecord } from './tag.schema.js';
import { PlatformType } from '../../platform/types.js';
import { ChannelPriority } from '../priority/types.js';
import { z } from 'zod';

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

export interface ChannelCreationBaseWithFetch {
  priority: ChannelPriority;
  followed: boolean;
  description: string | null;
  tagNames?: string[];
}

export interface ChannelCreationWithFetch extends ChannelCreationBaseWithFetch {
  pid: string;
  platform: PlatformType;
}

export interface ChannelCreation {
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platformName: string;
  priorityName: string;
  followed: boolean;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChannelDefForm {
  priority?: ChannelPriority;
  followed?: boolean;
  description?: string | null;
}

export interface ChannelRecordForm extends ChannelDefForm {
  pid?: string;
  platform?: PlatformType;
}

export interface ChannelDefUpdate {
  id: string;
  form: ChannelDefForm;
}

export interface ChannelRecordUpdate {
  id: string;
  form: ChannelRecordForm;
  tagNames?: string[];
}

export const channelSortEnum = z.enum(['latest', 'followerCnt']);
export const channelSortArg = channelSortEnum.optional();
export type ChannelSortType = z.infer<typeof channelSortArg>;
