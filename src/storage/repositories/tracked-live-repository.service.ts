import { Inject, Injectable } from '@nestjs/common';
import { WebhookRecord } from '../../webhook/types.js';
import { LiveInfo } from '../../platform/live.js';
import { WebhookRepository } from './webhook.repository.js';
import type { AsyncMap } from '../common/interface.js';
import { TRACKED_LIVE_MAP } from '../storage.module.js';

@Injectable()
export class TrackedLiveRepository {
  constructor(
    @Inject(TRACKED_LIVE_MAP) private readonly trackedMap: AsyncMap<string, LiveInfo>,
    public readonly whRepo: WebhookRepository,
  ) {}

  async clear() {
    await this.trackedMap.clear();
    await this.whRepo.clear();
  }

  async keys() {
    return this.trackedMap.keys();
  }

  async webhooks(): Promise<WebhookRecord[]> {
    return this.whRepo.values();
  }

  async get(id: string) {
    const value = await this.trackedMap.get(id);
    if (!value) return undefined;
    return value;
  }

  async set(id: string, info: LiveInfo, wh: WebhookRecord) {
    info.assignedWebhookName = wh.name;
    await this.trackedMap.set(id, info);
    await this.whRepo.updateWebhookCnt(wh.name, info.type, 1);
    return info;
  }

  async delete(id: string) {
    const live = await this.get(id);
    if (!live) throw Error(`${id} is not found`);
    if (!live.assignedWebhookName) {
      throw Error('live.assignedWebhookName is undefined');
    }

    await this.trackedMap.delete(id);
    await this.whRepo.updateWebhookCnt(live.assignedWebhookName, live.type, -1);

    return live;
  }

  async all() {
    const promises = (await this.keys()).map((key) => this.get(key));
    return (await Promise.all(promises)).filter((info) => info !== undefined);
  }
}
