import { vi } from 'vitest';
import { LiveInitializer } from './live.initializer.js';

export class LiveInitializerMock extends LiveInitializer {
  createNewLiveByLive = vi.fn();
  createNewLive = vi.fn();
}
