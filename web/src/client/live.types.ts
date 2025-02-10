import { ChannelRecord } from '@/client/channel.types.ts';
import { PlatformRecord } from '@/client/common.schema.ts';
import { NodeRecord } from '@/client/node.schema.ts';

export interface LiveRecord {
  id: string;
  platform: PlatformRecord;
  channel: ChannelRecord;
  nodeId: string;
  liveTitle: string;
  viewCnt: number;
  adult: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | undefined;
  deletedAt: string | undefined;
  node?: NodeRecord;
}
