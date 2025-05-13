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
  isInvalid: z.boolean().optional(), // TODO: remove optional()
});

export type LiveState = z.infer<typeof liveState>;

export abstract class StdlRedis {
  abstract setLiveDto(live: LiveDto): Promise<void>;
  abstract set(live: LiveState): Promise<void>;
  abstract get(id: string): Promise<LiveState | undefined>;
  abstract delete(id: string): Promise<void>;
  abstract dropAll(): Promise<void>;

  async isInvalidLive(live: LiveDto): Promise<boolean> {
    const liveState = await this.get(live.id);
    if (!liveState) {
      log.error(`Live not found in STDL`, liveNodeAttr(live));
      return true;
    }
    if (liveState.isInvalid) {
      log.error(`Live is not invalid`, liveNodeAttr(live));
      return true;
    }
    return false;
  }
}
