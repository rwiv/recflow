import { ChannelBase } from '../../platform/wapper/channel.js';
import { PlatformType } from '../../platform/types.js';
import { channels } from './schema.js';

export type ChannelEnt = typeof channels.$inferSelect;

export type ChannelPriority = 'must' | 'should' | 'may' | 'review' | 'skip' | 'none';

export interface ChannelDef extends ChannelBase {
  priority: ChannelPriority;
  followed: boolean;
  description: string | null;
}

export type ChannelEntCreation = ChannelDef;

export interface ChannelEntUpdate {
  id: string;
  form: {
    platform?: PlatformType;
    pid?: string;
    username?: string;
    profileImgUrl?: string | null;
    followerCount?: number;
    priority?: ChannelPriority;
    followed?: boolean;
    description?: string | null;
  };
}
