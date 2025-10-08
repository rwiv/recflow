import { platformNameEnum } from '../../../platform/spec/storage/platform.enum.schema.js';
import { z } from 'zod';
import { LiveDto } from '../../../live/spec/live.dto.schema.js';
import { headers, nonempty, queryParams, uuid } from '../../../common/data/common.schema.js';
import { log } from 'jslog';
import { liveAttr } from '../../../common/attr/attr.live.js';
import { stdlLocationType } from './stdl.types.js';

export const liveState = z.object({
  id: uuid,
  platform: platformNameEnum,
  channelId: nonempty,
  channelName: nonempty,
  liveId: nonempty,
  liveTitle: nonempty,
  platformCookie: nonempty.nullable(),
  streamUrl: nonempty,
  streamParams: queryParams.nullable(),
  streamHeaders: headers,
  videoName: nonempty,
  fsName: nonempty,
  location: stdlLocationType,
  isInvalid: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type LiveState = z.infer<typeof liveState>;

export const segmentKeyword = z.enum(['success', 'failed', 'retrying']);
export type SegmentKeyword = z.infer<typeof segmentKeyword>;

export abstract class StdlRedis {
  abstract createLiveState(live: LiveDto): Promise<void>;
  abstract getLiveState(id: string, useMaster: boolean): Promise<LiveState | null>;
  abstract getLiveStates(liveRecordIds: string[], useMaster: boolean): Promise<(LiveState | null)[]>;
  abstract deleteLiveState(id: string): Promise<void>;

  abstract getLivesIds(useMaster: boolean): Promise<string[]>;
  abstract getSegNums(liveId: string, keyword: SegmentKeyword, useMaster: boolean): Promise<string[]>;
  abstract deleteSegNumSet(liveId: string, keyword: SegmentKeyword): Promise<void>;
  abstract deleteSegmentStates(liveId: string, nums: string[]): Promise<void>;

  async isInvalidLive(live: LiveDto, useMaster: boolean = false): Promise<boolean> {
    const liveState = await this.getLiveState(live.id, useMaster);
    if (!liveState) {
      log.error(`Live not found in redis`, liveAttr(live));
      return true;
    }
    return liveState.isInvalid;
  }
}
