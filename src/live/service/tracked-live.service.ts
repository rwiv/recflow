import { Inject, Injectable } from '@nestjs/common';
import { WebhookRecord } from '../webhook/types.js';
import { LiveInfo } from '../../platform/wapper/live.js';
import { WebhookService } from './webhook.service.js';
import type { AsyncMap } from '../../infra/storage/interface.js';
import { TRACKED_LIVE_MAP } from '../persistence/persistence.module.js';
import { LiveRecord } from './types.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveEventListener } from '../event/listener.js';
import { PlatformWebhookMatcher } from './webhook.matcher.js';
import { ExitCmd } from '../event/types.js';

@Injectable()
export class TrackedLiveService {
  constructor(
    @Inject(TRACKED_LIVE_MAP) private readonly trackedMap: AsyncMap<string, LiveRecord>,
    private readonly fetcher: PlatformFetcher,
    private readonly listener: LiveEventListener,
    public readonly whService: WebhookService,
    private readonly whMatcher: PlatformWebhookMatcher,
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
  async add(info: LiveInfo): Promise<LiveRecord> {
    const webhook = this.whMatcher.matchWebhook(info, await this.webhooks());
    if (webhook === null) {
      // TODO: use ntfy
      throw Error(`No webhook matched for ${info.channelId}`);
    }
    const record = {
      ...info,
      savedAt: new Date().toISOString(),
      updatedAt: undefined,
      deletedAt: undefined,
      isDeleted: false,
      assignedWebhookName: webhook.name,
    };
    await this.trackedMap.set(info.channelId, record);
    await this.whService.updateWebhookCnt(webhook.name, info.type, 1);
    await this.listener.onCreate(record, webhook.url);
    return record;
  }

  /**
   * 이 메서드 내부에서 호출되는 `this.whRepo.updateWebhookCnt`가 직렬적으로 동작하기에
   * 병렬호출해도 성능상 병목이 발생할 수 있다.
   */
  async update(newRecord: LiveRecord) {
    const exists = await this.get(newRecord.channelId);
    if (!exists) throw Error(`Not found trackedRecord: ${newRecord.channelId}`);
    if (exists.assignedWebhookName !== newRecord.assignedWebhookName) {
      await this.whService.updateWebhookCnt(exists.assignedWebhookName, exists.type, -1);
      await this.whService.updateWebhookCnt(newRecord.assignedWebhookName, newRecord.type, 1);
    }
    await this.trackedMap.set(newRecord.channelId, newRecord);
    return exists;
  }

  async delete(id: string, cmd: ExitCmd = 'delete') {
    const record = await this.get(id);
    if (!record) throw Error(`Not found trackedRecord: ${id}`);
    if (record.isDeleted) throw Error(`Already deleted: ${id}`);

    record.isDeleted = true;
    record.deletedAt = new Date().toISOString();
    await this.trackedMap.set(id, record);
    await this.whService.updateWebhookCnt(record.assignedWebhookName, record.type, -1);

    await this.listener.onDelete(record, cmd);

    return record;
  }

  /**
   * 이 메서드는 배치 작업에서만 호출된다.
   * 통상 삭제 작업은 `delete` 메서드를 사용한다.
   */
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
    return this.whService.values();
  }

  async synchronize() {
    const records = await this.findAllActives();
    const entries = records.map((it) => [it.channelId, it] as const);
    const recordMap = new Map<string, LiveRecord>(entries);

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
    await this.whService.clear();
  }
}
