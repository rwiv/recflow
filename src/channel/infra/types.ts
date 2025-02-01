import { ChannelMeta } from '../../platform/wapper/channel.js';

type ChannelPriority = 'main' | 'sub' | 'extra';

export interface ChannelRecord extends ChannelMeta {
  id: string;
  priority: ChannelPriority;
  createdAt: Date;
  updatedAt: Date | undefined;
}
