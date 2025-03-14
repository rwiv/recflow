import { z } from 'zod';
import { nnint, nonempty } from '../../../common/data/common.schema.js';

export const soopLiveInfo = z.object({
  userId: nonempty,
  userNick: nonempty,
  stationName: nonempty.nullable(),
  broadStart: nonempty,
  broadNo: nnint,
  broadTitle: nonempty,
  broadThumb: z.string().url().nullable(),
  broadBps: nonempty.nullable(),
  broadResolution: nonempty.nullable(),
  broadCateNo: nonempty.nullable(),
  viewCnt: nnint,
  categoryTags: z.array(nonempty).nullable(),
  hashTags: z.array(nonempty).nullable(),
  adult: z.boolean(),
  locked: z.boolean(),
});
export type SoopLiveInfo = z.infer<typeof soopLiveInfo>;
export const soopLiveInfoResponse = z.array(soopLiveInfo);
export type SoopLiveInfoResponse = z.infer<typeof soopLiveInfoResponse>;

export const soopChannelInfo = z.object({
  userId: nonempty,
  userNick: nonempty,
  profileImageUrl: z.string().url().nullable(),
  profileText: nonempty.nullable(),
  stationName: nonempty,

  fanCnt: nnint,
  subscriptionCnt: nnint,
  isBestBj: z.boolean(),
  isPartnerBj: z.boolean(),

  broadStart: nonempty,
  openLive: z.boolean(),

  liveInfo: soopLiveInfo.nullable(),
});
export type SoopChannelInfo = z.infer<typeof soopChannelInfo>;
