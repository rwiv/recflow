import { z } from 'zod';
import { nnint, nonempty } from '../../../common/data/common.schema.js';

export const chzzkLiveInfo = z.object({
  channelId: nonempty,
  channelName: nonempty,
  channelImageUrl: z.string().url().nullable().optional(),
  liveId: nnint,
  liveTitle: nonempty,
  liveImageUrl: z.string().url().nullable().optional(),
  concurrentUserCount: nnint,
  openDate: nonempty,
  adult: z.boolean(),
  tags: z.array(nonempty).nullable().optional(),
  categoryType: nonempty.nullable().optional(),
  liveCategory: nonempty.nullable().optional(),
  liveCategoryValue: nonempty.nullable().optional(),
  watchPartyNo: nnint.nullable().optional(),
  watchPartyTag: nonempty.nullable().optional(),
  streamUrl: nonempty.optional(),
});
export type ChzzkLiveInfo = z.infer<typeof chzzkLiveInfo>;
export const chzzkLiveInfoResponse = z.array(chzzkLiveInfo);
export type ChzzkLiveInfoResponse = z.infer<typeof chzzkLiveInfoResponse>;

export const chzzkChannelInfo = z.object({
  channelId: nonempty,
  channelName: nonempty,
  channelImageUrl: z.string().url().nullable().optional(),

  channelDescription: nonempty.nullable().optional(),
  followerCount: nnint,
  openLive: z.boolean(),

  liveInfo: chzzkLiveInfo.nullable().optional(),
});
export type ChzzkChannelInfo = z.infer<typeof chzzkChannelInfo>;
