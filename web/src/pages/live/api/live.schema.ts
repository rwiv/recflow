import { z } from 'zod';
import { headers, nnint, nonempty, queryParams, uuid } from '@/shared/lib/schema/schema_common.ts';
import { platformDto } from '@/entities/platform/model/platform.schema.ts';
import { channelDto } from '@/entities/channel/channel/model/channel.schema.ts';

export const streamInfo = z.object({
  url: nonempty,
  params: queryParams.nullable(),
  headers: headers,
});
export type StreamInfo = z.infer<typeof streamInfo>;

export const liveDto = z.object({
  id: uuid,
  platform: platformDto,
  channel: channelDto,
  liveTitle: z.string(),
  viewCnt: nnint,
  isAdult: z.boolean(),
  isDisabled: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
});

export type LiveDto = z.infer<typeof liveDto>;
