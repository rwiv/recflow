import { ChannelBase } from '../../platform/wapper/channel.js';
import { TagRecord } from './tag.types.js';
import { PlatformType } from '../../platform/types.js';

export type ChannelPriority = 'must' | 'should' | 'may' | 'review' | 'skip' | 'none';

export interface ChannelDef extends ChannelBase {
  description: string | null;
  priority: ChannelPriority;
}

export interface ChannelRecord extends ChannelDef {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}

export type ChannelCreation = ChannelDef;

export interface ChannelUpdate {
  id: string;
  form: {
    ptype?: PlatformType;
    pid?: string;
    username?: string;
    profileImgUrl?: string | null;
    followerCount?: number;
    description?: string | null;
    priority?: ChannelPriority;
  };
}
