import { z } from 'zod';

import { nnint, nonempty } from '@/common/data/common.schema.js';

export const soopLiveInfo = z.object({
  userId: nonempty,
  userNick: nonempty,
  broadStart: nonempty,
  broadNo: nonempty,
  broadTitle: nonempty,
  broadCateNo: nonempty.nullable().optional(),
  viewCnt: nnint,
  hashTags: z.array(nonempty).nullable().optional(),
  adult: z.boolean(),
  locked: z.boolean(),
});
export type SoopLiveInfo = z.infer<typeof soopLiveInfo>;
export const soopLiveInfoResponse = z.array(soopLiveInfo);
export type SoopLiveInfoResponse = z.infer<typeof soopLiveInfoResponse>;

export const soopChannelInfo = z.object({
  userId: nonempty,
  userNick: nonempty,
  profileImageUrl: z.string().url().nullable().optional(),
  fanCnt: nnint,
  broadStart: nonempty,
  openLive: z.boolean(),
  liveInfo: soopLiveInfo.nullable().optional(),
});
export type SoopChannelInfo = z.infer<typeof soopChannelInfo>;
