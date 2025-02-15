import { ChannelDto } from '@/client/channel.types.ts';
import { PlatformDto } from '@/client/common.schema.ts';
import { NodeDto } from '@/client/node.schema.ts';

export interface LiveDto {
  id: string;
  platform: PlatformDto;
  channel: ChannelDto;
  nodeId: string;
  liveTitle: string;
  viewCnt: number;
  isAdult: boolean;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string | undefined;
  deletedAt: string | undefined;
  node?: NodeDto;
}
