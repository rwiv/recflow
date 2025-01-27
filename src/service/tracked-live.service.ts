import { Inject, Injectable } from '@nestjs/common';
import { WebhookRecord } from '../webhook/types.js';
import { LiveInfo } from '../platform/live.js';
import { WebhookService } from './webhook.service.js';
import type { AsyncMap } from '../storage/common/interface.js';
import { TRACKED_LIVE_MAP } from '../storage/storage.module.js';
import { TrackedRecord } from '../storage/types.js';
import { PlatformFetcher } from '../platform/fetcher.js';

@Injectable()
export class TrackedLiveService {
  constructor(
    @Inject(TRACKED_LIVE_MAP) private readonly trackedMap: AsyncMap<string, TrackedRecord>,
    public readonly whRepo: WebhookService,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async get(id: string) {
    const value = await this.trackedMap.get(id);
    if (!value) return undefined;
    return value;
  }

  /**
   * 이 메서드 내부에서 호출되는 `this.whRepo.updateWebhookCnt`가 직렬적으로 동작하기에
   * 병렬호출해도 성능상 병목이 발생할 수 있다.
   */
  async add(info: LiveInfo, webhookName: string): Promise<TrackedRecord> {
    const record = {
      ...info,
      savedAt: new Date().toISOString(),
      updatedAt: undefined,
      deletedAt: undefined,
      isDeleted: false,
      assignedWebhookName: webhookName,
    };
    await this.trackedMap.set(info.channelId, record);
    await this.whRepo.updateWebhookCnt(webhookName, info.type, 1);
    return record;
  }

  /**
   * 이 메서드 내부에서 호출되는 `this.whRepo.updateWebhookCnt`가 직렬적으로 동작하기에
   * 병렬호출해도 성능상 병목이 발생할 수 있다.
   */
  async update(newRecord: TrackedRecord) {
    const exists = await this.get(newRecord.channelId);
    if (!exists) throw Error(`Not found trackedRecord: ${newRecord.channelId}`);
    if (exists.assignedWebhookName !== newRecord.assignedWebhookName) {
      await this.whRepo.updateWebhookCnt(exists.assignedWebhookName, exists.type, -1);
      await this.whRepo.updateWebhookCnt(newRecord.assignedWebhookName, newRecord.type, 1);
    }
    await this.trackedMap.set(newRecord.channelId, newRecord);
    return exists;
  }

  async delete(id: string) {
    const record = await this.get(id);
    if (!record) throw Error(`Not found trackedRecord: ${id}`);
    if (record.isDeleted) throw Error(`Already deleted: ${id}`);

    record.isDeleted = true;
    record.deletedAt = new Date().toISOString();
    await this.trackedMap.set(id, record);
    await this.whRepo.updateWebhookCnt(record.assignedWebhookName, record.type, -1);

    return record;
  }

  async purge(id: string) {
    const live = await this.get(id);
    if (!live) throw Error(`Not found trackedRecord: ${id}`);
    if (!live.isDeleted) throw Error(`Not deleted: ${id}`);

    await this.trackedMap.delete(id);

    return live;
  }

  async findAllActives() {
    return (await this.findAll()).filter((it) => !it.isDeleted);
  }

  async findAllDeleted() {
    return (await this.findAll()).filter((it) => it.isDeleted);
  }

  private async findAll() {
    return this.trackedMap.values();
  }

  async keys() {
    return this.trackedMap.keys();
  }

  async webhooks(): Promise<WebhookRecord[]> {
    return this.whRepo.values();
  }

  async synchronize() {
    const records = await this.findAllActives();
    const entries = records.map((it) => [it.channelId, it] as const);
    const recordMap = new Map<string, TrackedRecord>(entries);

    const fetchPromises = records.map(async (live) => {
      return this.fetcher.fetchChannel(live.type, live.channelId, true);
    });
    const newChannels = (await Promise.all(fetchPromises)).filter((it) => it !== null);

    for (const channel of newChannels) {
      const record = recordMap.get(channel.id);
      if (!record) throw Error(`Record not found for ${channel.id}`);
      if (!channel.liveInfo) throw Error(`Live info not found for ${channel.id}`);
      await this.update({
        ...channel.liveInfo,
        savedAt: record.savedAt,
        updatedAt: new Date().toISOString(),
        deletedAt: record.deletedAt,
        isDeleted: record.isDeleted,
        assignedWebhookName: record.assignedWebhookName,
      });
    }
  }

  async clear() {
    await this.trackedMap.clear();
    await this.whRepo.clear();
  }
}
