import { LiveDto } from '../spec/live.dto.schema.js';
import { NewLiveRequest } from './live.initializer.impl.js';

export abstract class LiveInitializer {
  abstract createNewLiveByLive(base: LiveDto, opts: { checkM3u8: boolean }): Promise<string | null>;
  abstract createNewLive(req: NewLiveRequest): Promise<string | null>;
}
