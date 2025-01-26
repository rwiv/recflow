import { Inject, Injectable } from '@nestjs/common';
import { WebhookState } from '../../webhook/types.js';
import { QueryConfig } from '../../common/query.js';
import { PlatformType } from '../../platform/types.js';
import type { AsyncMap } from '../common/interface.js';
import { WEBHOOK_STATE_MAP } from '../storage.module.js';
import { QUERY } from '../../common/common.module.js';
import { LiveInfo } from '../../platform/live.js';

@Injectable()
export class WebhookStateRepository {
  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    @Inject(WEBHOOK_STATE_MAP) private readonly whMap: AsyncMap<string, WebhookState>,
  ) {}

  clear() {
    return this.whMap.clear();
  }

  async values(): Promise<WebhookState[]> {
    await this.syncWithQuery();
    return this.whMap.values();
  }

  async updateWebhookCnt(whName: string, type: PlatformType, num: 1 | -1) {
    const whState = await this.whMap.get(whName);
    if (whState === undefined) throw Error('Cannot found whState');

    let value: WebhookState;
    if (type === 'chzzk') {
      value = {
        ...whState,
        chzzkAssignedCnt: whState.chzzkAssignedCnt + num,
        soopAssignedCnt: whState.soopAssignedCnt,
      };
    } else if (type === 'soop') {
      value = {
        ...whState,
        chzzkAssignedCnt: whState.chzzkAssignedCnt,
        soopAssignedCnt: whState.soopAssignedCnt + num,
      };
    } else {
      throw Error('Invalid type');
    }
    await this.whMap.set(whName, value);
  }

  async synchronize(lives: LiveInfo[]) {
    await this.syncWithQuery();
    await this.syncWithLives(lives);
  }

  private async syncWithQuery() {
    const existedEntries = await this.whMap.entries();

    // Delete webhooks that are not assigned
    const toBeDeleted: string[] = [];
    for (const [key, value] of existedEntries) {
      if (value.chzzkAssignedCnt === 0 && value.soopAssignedCnt === 0) {
        toBeDeleted.push(key);
      }
    }

    // Create webhooks for newly added
    const toBeCreated: [string, WebhookState][] = [];
    const keys = existedEntries.map(([key, _]) => key);
    for (const whInfo of this.query.webhooks) {
      if (!keys.includes(whInfo.name)) {
        const whState: WebhookState = {
          ...whInfo,
          chzzkAssignedCnt: 0,
          soopAssignedCnt: 0,
        };
        toBeCreated.push([whInfo.name, whState]);
      }
    }

    // Update the map
    await Promise.all(toBeDeleted.map((name) => this.whMap.delete(name)));
    await Promise.all(toBeCreated.map(([whName, whs]) => this.whMap.set(whName, whs)));
  }

  private async syncWithLives(lives: LiveInfo[]) {
    const whMap = new Map<string, WebhookState>();
    for (const wh of await this.whMap.values()) {
      whMap.set(wh.name, {
        ...wh,
        chzzkAssignedCnt: 0,
        soopAssignedCnt: 0,
      });
    }

    for (const live of lives) {
      if (!live.assignedWebhookName) {
        throw Error('Cannot found webhook');
      }
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
