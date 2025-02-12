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
  categoryType: z.string().nullable().optional(),
  liveCategory: z.string().nullable().optional(),
  liveCategoryValue: z.string().nullable(),
  watchPartyNo: z.number().nullable(),
  watchPartyTag: z.string().nullable(),
});
export type ChzzkLiveInfo = z.infer<typeof chzzkLiveInfo>;
// export interface ChzzkLiveInfo {
//   channelId: string;
//   channelName: string;
//   channelImageUrl: string;
//   liveId: number;
//   liveTitle: string;
//   liveImageUrl: string;
//   concurrentUserCount: number;
//   accumulateCount: number;
//   openDate: string;
//   adult: boolean;
//   tags: string[];
//   categoryType?: string | null;
//   liveCategory?: string | null;
//   liveCategoryValue: string | null;
//   watchPartyNo: number | null;
//   watchPartyTag: string | null;
// }

export interface ChzzkChannelInfo {
  channelId: string;
  channelName: string;
  channelImageUrl: string;

  channelDescription: string;
  followerCount: number;
  openLive: boolean;

  liveInfo: ChzzkLiveInfo | null;
}
