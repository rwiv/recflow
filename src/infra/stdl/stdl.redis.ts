import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { z } from 'zod';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { nnint, nonempty, uuid } from '../../common/data/common.schema.js';

export const liveState = z.object({
  id: uuid,
  platform: platformNameEnum,
  channelId: nonempty,
  channelName: nonempty,
  liveId: nonempty,
  liveTitle: nonempty,
  streamUrl: nonempty,
  latestNum: nnint.nullable(),
  cookie: nonempty.nullable(),
  videoName: nonempty,
});

export type LiveState = z.infer<typeof liveState>;

export interface StdlRedis {
  setLiveDto(live: LiveDto, enforceCreds: boolean): Promise<void>;
  set(live: LiveState): Promise<void>;
  get(id: string): Promise<LiveState | undefined>;
  delete(id: string): Promise<void>;
  dropAll(): Promise<void>;
}
