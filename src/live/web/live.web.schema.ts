import { z } from 'zod';

import { uuid } from '@/common/data/common.schema.js';

import { platformNameEnum } from '@/platform/spec/storage/platform.enum.schema.js';

import { exitCmd } from '@/live/spec/event.schema.js';
import { streamInfo } from '@/live/spec/live.dto.schema.js';

export const liveAppendRequest = z.object({
  sourceId: z.string().nonempty(),
  platformName: platformNameEnum,
  stream: streamInfo.nullable(),
});
export type LiveAppendRequest = z.infer<typeof liveAppendRequest>;

export const liveDeleteRequest = z.object({
  recordId: uuid,
  cmd: exitCmd,
  isPurge: z.boolean(),
});
export type LiveDeleteRequest = z.infer<typeof liveDeleteRequest>;
