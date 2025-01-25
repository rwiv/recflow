import { Inject } from '@nestjs/common';
import { DELETED_LIVE_MAP } from '../storage.module.js';

export class DeletedLiveRepository {
  constructor(@Inject(DELETED_LIVE_MAP) private readonly map: Map<string, string>) {}
}
