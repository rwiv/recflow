import { z } from 'zod';
import { nnint, nonempty } from '../../../common/data/common.schema.js';

export const chzzkLiveInfo = z.object({
  channelId: nonempty,
  channelName: nonempty,
  channelImageUrl: z.string().url().nullable(),
  liveId: nnint,
  liveTitle: nonempty,
  liveImageUrl: z.string().url().nullable(),
  concurrentUserCount: nnint,
  accumulateCount: nnint,
  openDate: nonempty,
  adult: z.boolean(),
  tags: z.array(nonempty),
  categoryType: nonempty.nullable(),
  liveCategory: nonempty.nullable(),
  liveCategoryValue: nonempty.nullable(),
  watchPartyNo: nnint.nullable(),
  watchPartyTag: nonempty.nullable(),
});
export type ChzzkLiveInfo = z.infer<typeof chzzkLiveInfo>;
export const chzzkLiveInfoResponse = z.array(chzzkLiveInfo);
export type ChzzkLiveInfoResponse = z.infer<typeof chzzkLiveInfoResponse>;

export const chzzkChannelInfo = z.object({
  channelId: nonempty,
  channelName: nonempty,
  channelImageUrl: z.string().url().nullable(),

  channelDescription: nonempty.nullable(),
  followerCount: nnint,
  openLive: z.boolean(),

  liveInfo: chzzkLiveInfo.nullable(),
});
export type ChzzkChannelInfo = z.infer<typeof chzzkChannelInfo>;
