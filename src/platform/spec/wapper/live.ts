import { chzzkLiveInfo, ChzzkLiveInfo } from '../raw/chzzk.js';
import { soopLiveInfo, SoopLiveInfo } from '../raw/soop.js';
import { platformNameEnum } from '../storage/platform.enum.schema.js';
import { z } from 'zod';

export const liveInfo = z.object({
  type: platformNameEnum,
  pid: z.string(),
  channelName: z.string(),
  liveId: z.number(),
  liveTitle: z.string(),
  viewCnt: z.number(),
  isAdult: z.boolean(),
  openDate: z.string(),
  content: z.union([chzzkLiveInfo, soopLiveInfo]),
});
export type LiveInfo = z.infer<typeof liveInfo>;

export function liveFromChzzk(info: ChzzkLiveInfo): LiveInfo {
  return {
    type: 'chzzk',
    pid: info.channelId,
    channelName: info.channelName,
    liveId: info.liveId,
    liveTitle: info.liveTitle,
    viewCnt: info.concurrentUserCount,
    isAdult: info.adult,
    openDate: new Date(info.openDate).toISOString(),
    content: info,
  };
}

export function liveFromSoop(info: SoopLiveInfo): LiveInfo {
  return {
    type: 'soop',
    pid: info.userId,
    channelName: info.userNick,
    liveId: info.broadNo,
    liveTitle: info.broadTitle,
    viewCnt: info.viewCnt,
    isAdult: info.adult,
    openDate: new Date(info.broadStart).toISOString(),
    content: info,
  };
}
