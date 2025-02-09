import { z } from 'zod';

export const soopLiveInfo = z.object({
  userId: z.string(),
  userNick: z.string(),
  stationName: z.string(),
  broadStart: z.string(),
  broadNo: z.string(),
  broadTitle: z.string(),
  broadThumb: z.string().url(),
  broadBps: z.string(),
  broadResolution: z.string(),
  broadCateNo: z.string(),
  totalViewCnt: z.string(),
  categoryTags: z.array(z.string()),
  hashTags: z.array(z.string()),
  adult: z.boolean(),
  locked: z.boolean(),
});
export type SoopLiveInfo = z.infer<typeof soopLiveInfo>;
// export interface SoopLiveInfo {
//   userId: string;
//   userNick: string;
//   stationName: string;
//   broadStart: string;
//
//   broadNo: string;
//   broadTitle: string;
//   broadThumb: string;
//   broadBps: string;
//   broadResolution: string;
//   broadCateNo: string;
//   totalViewCnt: string;
//   categoryTags: string[];
//   hashTags: string[];
//   adult: boolean;
//   locked: boolean;
// }

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
