import { z } from 'zod';

export const chzzkLiveInfo = z.object({
  channelId: z.string(),
  channelName: z.string(),
  channelImageUrl: z.string().url(),
  liveId: z.number(),
  liveTitle: z.string(),
  liveImageUrl: z.string().url(),
  concurrentUserCount: z.number(),
  accumulateCount: z.number(),
  openDate: z.string(),
  adult: z.boolean(),
  tags: z.array(z.string()),
  categoryType: z.string().nullable(),
  liveCategory: z.string().nullable(),
  liveCategoryValue: z.string().nullable(),
  watchPartyNo: z.number().nullable(),
  watchPartyTag: z.string().nullable(),
});
export type ChzzkLiveInfo = z.infer<typeof chzzkLiveInfo>;
export const chzzkLiveInfoResponse = z.array(chzzkLiveInfo);
export type ChzzkLiveInfoResponse = z.infer<typeof chzzkLiveInfoResponse>;

export const chzzkChannelInfo = z.object({
  channelId: z.string(),
  channelName: z.string(),
  channelImageUrl: z.string().url().nullable(),

  channelDescription: z.string().nullable(),
  followerCount: z.number(),
  openLive: z.boolean(),

  liveInfo: chzzkLiveInfo.nullable(),
});
export type ChzzkChannelInfo = z.infer<typeof chzzkChannelInfo>;
