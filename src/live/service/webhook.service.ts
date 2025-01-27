import { Inject, Injectable } from '@nestjs/common';
import { WebhookRecord } from '../webhook/types.js';
import { QueryConfig } from '../../common/query.js';
import { PlatformType } from '../../platform/types.js';
import type { AsyncMap } from '../../infra/storage/interface.js';
import { WEBHOOK_MAP } from '../persistence/persistence.module.js';
import { QUERY } from '../../common/config.module.js';
import { LiveRecord } from './types.js';

@Injectable()
export class WebhookService {
  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    @Inject(WEBHOOK_MAP) private readonly whMap: AsyncMap<string, WebhookRecord>,
  ) {}

  clear() {
    return this.whMap.clear();
  }

  async values(): Promise<WebhookRecord[]> {
    await this.syncWithConfig();
    return this.whMap.values();
  }

  /**
   * 이 메서드는 병렬적으로 호출되면 동시성 이슈를 발생시킨다.
   * TODO: distributed lock을 사용하여 동시성 이슈 해결
   */
  async updateWebhookCnt(whName: string, type: PlatformType, num: 1 | -1) {
    const webhook = await this.whMap.get(whName);
    if (webhook === undefined) throw Error('Cannot found webhook');

    let value: WebhookRecord;
    if (type === 'chzzk') {
      value = {
        ...webhook,
        chzzkAssignedCnt: webhook.chzzkAssignedCnt + num,
        soopAssignedCnt: webhook.soopAssignedCnt,
      };
    } else if (type === 'soop') {
      value = {
        ...webhook,
        chzzkAssignedCnt: webhook.chzzkAssignedCnt,
        soopAssignedCnt: webhook.soopAssignedCnt + num,
      };
    } else {
      throw Error('Invalid type');
    }
    await this.whMap.set(whName, value);
  }

  async synchronize(lives: LiveRecord[]) {
    await this.syncWithConfig();
    await this.syncWithLives(lives);
  }

  private async syncWithConfig() {
    const existedEntries = await this.whMap.entries();

    // Delete webhooks that are not assigned
    const toBeDeleted: string[] = [];
    for (const [key, value] of existedEntries) {
      if (!this.query.webhooks.map((it) => it.name).includes(key)) {
        if (value.chzzkAssignedCnt === 0 && value.soopAssignedCnt === 0) {
          toBeDeleted.push(key);
        }
      }
    }

    // Create webhooks for newly added
    const toBeCreated: [string, WebhookRecord][] = [];
    const keys = existedEntries.map(([key, _]) => key);
    for (const whInfo of this.query.webhooks) {
      if (!keys.includes(whInfo.name)) {
        const webhook: WebhookRecord = {
          ...whInfo,
          chzzkAssignedCnt: 0,
          soopAssignedCnt: 0,
        };
        toBeCreated.push([whInfo.name, webhook]);
      }
    }

    // Update the map
    await Promise.all(toBeDeleted.map((name) => this.whMap.delete(name)));
    await Promise.all(toBeCreated.map(([whName, whs]) => this.whMap.set(whName, whs)));
  }

  private async syncWithLives(lives: LiveRecord[]) {
    const whMap = new Map<string, WebhookRecord>();
    for (const wh of await this.whMap.values()) {
      whMap.set(wh.name, {
        ...wh,
        chzzkAssignedCnt: 0,
        soopAssignedCnt: 0,
      });
    }

    for (const live of lives) {
      const wh = whMap.get(live.assignedWebhookName);
      if (!wh) {
        throw Error('Cannot found webhook');
      }

      if (live.type === 'chzzk') {
        wh.chzzkAssignedCnt += 1;
      } else if (live.type === 'soop') {
        wh.soopAssignedCnt += 1;
      } else {
        throw Error('Invalid platform');
      }
    }

    return Promise.all(Array.from(whMap.values()).map((wh) => this.whMap.set(wh.name, wh)));
  }
}
