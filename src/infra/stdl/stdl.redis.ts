import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { z } from 'zod';
import { LiveDto } from '../../live/spec/live.dto.schema.js';

export const liveState = z.object({
  platfrom: platformNameEnum,
  channelId: z.string(),
  channelName: z.string(),
  liveId: z.string(),
  liveTitle: z.string(),
  streamUrl: z.string(),
  latestNum: z.number().nullable(),
  cookie: z.string().nullable(),
  videoName: z.string(),
});

export type LiveState = z.infer<typeof liveState>;

export interface StdlRedis {
  setLiveDto(live: LiveDto): Promise<void>;
  setLive(live: LiveState): Promise<void>;
  getLive(id: string): Promise<LiveState | undefined>;
}
