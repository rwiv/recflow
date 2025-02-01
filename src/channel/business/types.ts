import { ChannelDef } from '../../platform/wapper/channel.js';

type ChannelPriority = 'main' | 'sub' | 'extra';

export interface ChannelCreation extends ChannelDef {
  description: string | null;
  priority: ChannelPriority;
}

export interface ChannelUpdate extends ChannelCreation {
  id: string;
}

export interface ChannelRecord extends ChannelCreation {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  tags?: TagRecord[];
}

export interface TagRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
