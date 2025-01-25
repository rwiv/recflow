import { Inject, Injectable } from '@nestjs/common';
import { WebhookState } from '../../webhook/types.js';
import { LiveInfo } from '../../platform/live.js';
import { WebhookStateRepository } from '../webhook/webhook-state.repository.js';
import { AsyncMap } from '../common/interface.js';
import { TARGET_MAP } from '../storage.module.js';

@Injectable()
export class TargetedLiveRepository {
  constructor(
    @Inject(TARGET_MAP) private readonly targetMap: AsyncMap<string, LiveInfo>,
    public readonly whRepo: WebhookStateRepository,
  ) {}

  async clear() {
    await this.targetMap.clear();
    await this.whRepo.clear();
  }

  async keys() {
    return this.targetMap.keys();
  }

  async webhooks(): Promise<WebhookState[]> {
    return this.whRepo.values();
  }

  async get(id: string) {
    const value = await this.targetMap.get(id);
    if (!value) return undefined;
    return LiveInfo.fromObject(value);
  }

  async set(id: string, info: LiveInfo, wh: WebhookState) {
    info.assignedWebhookName = wh.name;
    await this.targetMap.set(id, info);
    await this.whRepo.updateWebhookCnt(wh.name, info.type, 1);
    return info;
  }

  async delete(id: string) {
    const live = await this.get(id);
    if (!live) throw Error(`${id} is not found`);
    if (!live.assignedWebhookName) {
      throw Error('live.assignedWebhookName is undefined');
    }

    await this.targetMap.delete(id);
    await this.whRepo.updateWebhookCnt(live.assignedWebhookName, live.type, -1);

    return live;
  }

  async all() {
    const promises = (await this.keys()).map((key) => this.get(key));
    return (await Promise.all(promises)).filter((info) => info !== undefined);
  }

  async allChzzk(): Promise<LiveInfo[]> {
    return (await this.all()).filter((info) => info.type === 'chzzk');
  }

  async allSoop(): Promise<LiveInfo[]> {
    return (await this.all()).filter((info) => info.type === 'soop');
  }
}
