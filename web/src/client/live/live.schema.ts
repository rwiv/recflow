import { channelDto } from '@/client/channel/channel.types.ts';
import {platformDto} from '@/client/common/platform.schema.ts';
import { z } from 'zod';
import { nnint, uuid } from '@/common/common.schema.ts';

export const liveDto = z.object({
  id: uuid,
  platform: platformDto,
  channel: channelDto,
  nodeId: uuid.nullable(),
  liveTitle: z.string(),
  viewCnt: nnint,
  isAdult: z.boolean(),
  isDisabled: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
});

export type LiveDto = z.infer<typeof liveDto>;
