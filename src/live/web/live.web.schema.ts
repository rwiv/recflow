import { z } from 'zod';
import { platformType } from '../../platform/storage/platform.business.schema.js';
import { exitCmd } from '../event/event.schema.js';
import { uuid } from '../../common/data/common.schema.js';

export const liveAppendRequest = z.object({
  pid: z.string().nonempty(),
  platformName: platformType,
});
export type LiveAppendRequest = z.infer<typeof liveAppendRequest>;

export const liveDeleteRequest = z.object({
  recordId: uuid,
  cmd: exitCmd,
});
export type LiveDeleteRequest = z.infer<typeof liveDeleteRequest>;
