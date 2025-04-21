import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

export interface LiveState {
  platfrom: PlatformName;
  channelId: string;
  channelName: string;
  liveId: string;
  liveTitle: string;
  streamUrl: string;
  startedAt: string;
  latestNum: number | null;
  cookie: string | null;
  videoName: string;
}

export interface StdlRedis {
  setLive(live: LiveState): Promise<void>;
  getLive(id: string): Promise<LiveState>;
}
