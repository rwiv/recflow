import { Inject, Injectable } from '@nestjs/common';
import { WebhookRecord } from '../../webhook/types.js';
import { LiveInfo } from '../../platform/live.js';
import { WebhookRepository } from './webhook.repository.js';
import type { AsyncMap } from '../common/interface.js';
import { TRACKED_LIVE_MAP } from '../storage.module.js';
import { TrackedRecord } from '../types.js';
import { PlatformFetcher } from '../../platform/fetcher.js';

@Injectable()
export class TrackedLiveRepository {
  constructor(
    @Inject(TRACKED_LIVE_MAP) private readonly trackedMap: AsyncMap<string, TrackedRecord>,
    public readonly whRepo: WebhookRepository,
    private readonly fetcher: PlatformFetcher,
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

  async synchronize() {
    const records = await this.all();
    const entries = records.map((it) => [it.channelId, it] as const);
    const recordMap = new Map<string, TrackedRecord>(entries);

    const fetchPromises = records.map(async (live) => {
      return this.fetcher.fetchChannel(live.type, live.channelId, true);
    });
    const newLives = (await Promise.all(fetchPromises)).filter((it) => it !== null);

    for (const live of newLives) {
      const record = recordMap.get(live.id);
      if (!record) throw Error(`Record not found for ${live.id}`);
      if (!live.liveInfo) throw Error(`Live info not found for ${live.id}`);
      await this.set(live.id, live.liveInfo, record.assignedWebhookName);
    }
  }

  async get(id: string) {
    const value = await this.trackedMap.get(id);
    if (!value) return undefined;
    return value;
  }

  /**
   * 이 메서드 내부에서 호출되는 `this.whRepo.updateWebhookCnt`가 직렬적으로 동작하기에
   * `this.set`을 병렬호출해도 성능상 병목이 발생할 수 있다.
   */
  async set(id: string, info: LiveInfo, webhookName: string): Promise<TrackedRecord> {
    const record = {
      ...info,
      assignedWebhookName: webhookName,
    };
    await this.trackedMap.set(id, record);
    await this.whRepo.updateWebhookCnt(webhookName, info.type, 1);
    return record;
  }

  async delete(id: string) {
    const live = await this.get(id);
    if (!live) throw Error(`${id} is not found`);
    await this.trackedMap.delete(id);
    await this.whRepo.updateWebhookCnt(live.assignedWebhookName, live.type, -1);

    return live;
  }

  async all() {
    const promises = (await this.keys()).map((key) => this.get(key));
    return (await Promise.all(promises)).filter((info) => info !== undefined);
  }
}
