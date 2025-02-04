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
