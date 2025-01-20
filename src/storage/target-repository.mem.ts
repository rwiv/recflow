import { TargetRepository } from './types.js';
import { QueryConfig } from '../common/query.js';
import { WebhookState } from '../webhook/types.js';
import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../common/common.module.js';
import { LiveInfo } from '../platform/wrapper.live.js';
import { PlatformType } from '../platform/common.js';

interface WebhookCntState {
  chzzk: number;
  soop: number;
}

@Injectable()
export class TargetRepositoryMem implements TargetRepository {
  private readonly map: Map<string, LiveInfo> = new Map();
  private readonly whMap: Map<string, WebhookCntState> = new Map();

  constructor(@Inject(QUERY) private readonly query: QueryConfig) {
    const names = query.webhooks.map((wh) => wh.name);
    for (const name of names) {
      const whcState: WebhookCntState = { chzzk: 0, soop: 0 };
      this.whMap.set(name, whcState);
    }
  }

  async whStates() {
    return this.query.webhooks.map((wh) => {
      const whcState = this.whMap.get(wh.name);
      if (whcState === undefined) {
        throw Error('whcState is undefined');
      }
      return {
        ...wh,
        chzzkAssignedCnt: whcState.chzzk,
        soopAssignedCnt: whcState.soop,
      };
    });
  }

  async set(id: string, info: LiveInfo, wh: WebhookState) {
    if (this.map.get(id)) {
      throw Error(`${id} is already exists`);
    }
    this.updateWebhookCnt(wh.name, info.type, 1);

    this.map.set(id, info);
    return info;
  }

  updateWebhookCnt(whName: string, type: PlatformType, num: 1 | -1) {
    const whcState = this.whMap.get(whName);
    if (whcState === undefined) {
      throw Error('whcState is undefined');
    }
    if (type === 'chzzk') {
      this.whMap.set(whName, {
        chzzk: whcState.chzzk + num,
        soop: whcState.soop,
      });
    } else {
      this.whMap.set(whName, {
        chzzk: whcState.chzzk,
        soop: whcState.soop + num,
      });
    }
  }

  async get(id: string) {
    return this.map.get(id);
  }

  async delete(id: string) {
    const live = this.map.get(id);
    if (!live) {
      throw Error(`${id} is not found`);
    }
    this.updateWebhookCnt(live.assignedWebhookName, live.type, -1);
    this.map.delete(id);
    return live;
  }

  async all() {
    return Array.from(this.map.values());
  }

  async allChzzk(): Promise<LiveInfo[]> {
    return (await this.all()).filter((info) => info.type === 'chzzk');
  }

  async allSoop(): Promise<LiveInfo[]> {
    return (await this.all()).filter((info) => info.type === 'soop');
  }
}
