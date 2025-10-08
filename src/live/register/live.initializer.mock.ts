import { vi } from 'vitest';
import { LiveInitializer } from './live.initializer.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NewLiveRequest } from './live.initializer.impl.js';

export class LiveInitializerMock extends LiveInitializer {
  _createNewLiveByLive = vi.fn();
  _createNewLive = vi.fn();

  createNewLiveByLive(base: LiveDto, opts: { checkM3u8: boolean }): Promise<string | null> {
    return this._createNewLiveByLive(base, opts);
  }

  createNewLive(req: NewLiveRequest): Promise<string | null> {
    return this._createNewLive(req);
  }
}
