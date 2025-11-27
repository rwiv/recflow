import { z } from 'zod';
import { headers, nonempty, queryParams, uuid } from '../../../common/data/common.schema.js';
import { platformNameEnum } from '../../../platform/spec/storage/platform.enum.schema.js';
import { recnodeLocationType } from '../common/recnode.types.js';

export const liveState = z.object({
  id: uuid,
  platform: platformNameEnum,
  channelId: nonempty,
  channelName: nonempty,
  liveId: nonempty,
  liveTitle: nonempty,
  platformCookie: nonempty.nullable(),
  streamUrl: nonempty,
  streamParams: queryParams.nullable(),
  streamHeaders: headers,
  videoName: nonempty,
  fsName: nonempty,
  location: recnodeLocationType,
  isInvalid: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type LiveState = z.infer<typeof liveState>;

export const segmentKeyword = z.enum(['success', 'failed', 'retrying']);
export type SegmentKeyword = z.infer<typeof segmentKeyword>;
