import { z } from 'zod';

export const soopLiveInfo = z.object({
  userId: z.string(),
  userNick: z.string(),
  stationName: z.string().nullable(),
  broadStart: z.string(),
  broadNo: z.number(),
  broadTitle: z.string(),
  broadThumb: z.string().url().nullable(),
  broadBps: z.string().nullable(),
  broadResolution: z.string().nullable(),
  broadCateNo: z.string().nullable(),
  viewCnt: z.number(),
  categoryTags: z.array(z.string()).nullable(),
  hashTags: z.array(z.string()).nullable(),
  adult: z.boolean(),
  locked: z.boolean(),
});
export type SoopLiveInfo = z.infer<typeof soopLiveInfo>;
export const soopLiveInfoResponse = z.array(soopLiveInfo);
export type SoopLiveInfoResponse = z.infer<typeof soopLiveInfoResponse>;

export const soopChannelInfo = z.object({
  userId: z.string(),
  userNick: z.string(),
  profileImageUrl: z.string().url(),
  profileText: z.string(),
  stationName: z.string(),

  fanCnt: z.number(),
  subscriptionCnt: z.number(),
  isBestBj: z.boolean(),
  isPartnerBj: z.boolean(),

  broadStart: z.string(),
  openLive: z.boolean(),

  liveInfo: soopLiveInfo.nullable(),
});
export type SoopChannelInfo = z.infer<typeof soopChannelInfo>;
