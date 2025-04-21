import { chzzkLiveInfo, ChzzkLiveInfo } from '../raw/chzzk.js';
import { soopLiveInfo, SoopLiveInfo } from '../raw/soop.js';
import { platformNameEnum } from '../storage/platform.enum.schema.js';
import { z } from 'zod';
import { nnint, nonempty } from '../../../common/data/common.schema.js';

export const liveInfo = z.object({
  type: platformNameEnum,
  pid: nonempty,
  channelName: nonempty,
  liveId: nonempty,
  liveTitle: nonempty,
  streamUrl: nonempty.nullable(),
  viewCnt: nnint,
  isAdult: z.boolean(),
  openDate: nonempty,
  content: z.union([chzzkLiveInfo, soopLiveInfo]),
});
export type LiveInfo = z.infer<typeof liveInfo>;

export function liveFromChzzk(info: ChzzkLiveInfo): LiveInfo {
  return {
    type: 'chzzk',
    pid: info.channelId,
    channelName: info.channelName,
    liveId: info.liveId.toString(),
    liveTitle: info.liveTitle,
    streamUrl: info.streamUrl ?? null,
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
    streamUrl: info.streamUrl ?? null,
    viewCnt: info.viewCnt,
    isAdult: info.adult,
    openDate: new Date(info.broadStart).toISOString(),
    content: info,
  };
}
