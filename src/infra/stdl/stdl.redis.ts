import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { z } from 'zod';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { headers, nonempty, uuid } from '../../common/data/common.schema.js';
import { log } from 'jslog';
import { liveNodeAttr } from '../../common/attr/attr.live.js';

export const liveState = z.object({
  id: uuid,
  platform: platformNameEnum,
  channelId: nonempty,
  channelName: nonempty,
  liveId: nonempty,
  liveTitle: nonempty,
  streamUrl: nonempty,
  headers: headers.nullable(),
  videoName: nonempty,
  isInvalid: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export type LiveState = z.infer<typeof liveState>;

export abstract class StdlRedis {
  abstract setLive(live: LiveDto): Promise<void>;
  abstract getLive(id: string): Promise<LiveState | undefined>;
  abstract getLives(liveRecordIds: string[]): Promise<(LiveState | undefined)[]>;
  abstract deleteLive(id: string): Promise<void>;
  abstract dropAllLives(): Promise<void>;

  abstract getLivesIds(): Promise<string[]>;
  abstract getSuccessSegNums(liveId: string): Promise<string[]>;
  abstract deleteSuccessSegNumSet(liveId: string): Promise<void>;
  abstract deleteSegmentState(liveId: string, num: string): Promise<void>;

  async isInvalidLive(live: LiveDto): Promise<boolean> {
    const liveState = await this.getLive(live.id);
    if (!liveState) {
      log.error(`Live not found in STDL`, liveNodeAttr(live));
      return true;
    }
    if (liveState.isInvalid) {
      log.error(`Live is invalid`, liveNodeAttr(live));
      return true;
    }
    return false;
  }
}
