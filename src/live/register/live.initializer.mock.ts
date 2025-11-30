import { vi } from 'vitest';

import { NewLiveRequest } from '@/live/register/live.initializer.impl.js';
import { LiveInitializer } from '@/live/register/live.initializer.js';
import { LiveDto } from '@/live/spec/live.dto.schema.js';

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
