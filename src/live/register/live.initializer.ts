import { NewLiveRequest } from '@/live/register/live.initializer.impl.js';
import { LiveDto } from '@/live/spec/live.dto.schema.js';

export abstract class LiveInitializer {
  abstract createNewLiveByLive(base: LiveDto, opts: { checkM3u8: boolean }): Promise<string | null>;

  abstract createNewLive(req: NewLiveRequest): Promise<string | null>;
}
