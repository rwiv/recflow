import { ChannelDef, ChannelPriority } from '../persistence/channel.types.js';
import { TagRecord } from './tag.types.js';
import { PlatformType } from '../../platform/types.js';

export interface ChannelRecord extends ChannelDef {
  id: string;
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

export interface ChannelUpdate {
  id: string;
  form: {
    pid?: string;
    platform?: PlatformType;
    priority?: ChannelPriority;
    followed?: boolean;
    description?: string | null;
  };
  tagNames?: string[];
}
