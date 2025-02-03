import { ChannelDef } from '../persistence/channel.types.js';
import { TagRecord } from './tag.types.js';

export interface ChannelRecord extends ChannelDef {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}
