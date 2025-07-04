import { z } from 'zod';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { exitCmd } from '../spec/event.schema.js';
import { uuid } from '../../common/data/common.schema.js';

export const liveAppendRequest = z.object({
  pid: z.string().nonempty(),
  platformName: platformNameEnum,
  streamUrl: z.string().nonempty().nullable(),
  headers: z.record(z.string()).nullable(),
});
export type LiveAppendRequest = z.infer<typeof liveAppendRequest>;

export const liveDeleteRequest = z.object({
  recordId: uuid,
  cmd: exitCmd,
  isPurge: z.boolean(),
});
export type LiveDeleteRequest = z.infer<typeof liveDeleteRequest>;
