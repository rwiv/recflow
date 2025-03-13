import { z } from 'zod';

export const soopLiveInfo = z.object({
  userId: z.string(),
  userNick: z.string(),
  stationName: z.string(),
  broadStart: z.string(),
  broadNo: z.number(),
  broadTitle: z.string(),
  broadThumb: z.string().url().nullable(),
  broadBps: z.string(),
  broadResolution: z.string(),
  broadCateNo: z.string(),
  viewCnt: z.number(),
  categoryTags: z.array(z.string()).nullable(),
  hashTags: z.array(z.string()).nullable(),
  adult: z.boolean(),
  locked: z.boolean(),
});
export type SoopLiveInfo = z.infer<typeof soopLiveInfo>;

export interface SoopChannelInfo {
  userId: string;
  userNick: string;
  profileImageUrl: string;
  profileText: string;
  stationName: string;

  fanCnt: number;
  subscriptionCnt: number;
  isBestBj: boolean;
  isPartnerBj: boolean;

  broadStart: string;
  openLive: boolean;

  liveInfo: SoopLiveInfo | null;
}
