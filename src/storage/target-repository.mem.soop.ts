import { SoopLiveState, SoopTargetRepository } from './types.js';
import { SoopLiveInfo } from '../client/types.soop.js';
import { QueryConfig } from '../common/query.js';
import { SoopWebhookState } from '../webhook/types.js';
import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../common/common.module.js';

@Injectable()
export class TargetRepositoryMemSoop implements SoopTargetRepository {
  private readonly map: Map<string, SoopLiveState> = new Map();
  private readonly whMap: Map<string, number> = new Map();

  constructor(@Inject(QUERY) private readonly query: QueryConfig) {
    const names = query.webhooks.map((wh) => wh.name);
    for (const name of names) {
      this.whMap.set(name, 0);
    }
  }

  async whStates() {
    return this.query.webhooks.map((wh) => {
      const whCnt = this.whMap.get(wh.name);
      if (whCnt === undefined) {
        throw Error('whCnt is undefined');
      }
      return { ...wh, soopAssignedCnt: whCnt };
    });
  }

  async set(id: string, info: SoopLiveInfo, wh: SoopWebhookState) {
    if (this.map.get(id)) {
      throw Error(`${id} is already exists`);
    }
    const curCnt = this.whMap.get(wh.name);
    if (curCnt === undefined) {
      throw Error('curCnt is undefined');
    }
    this.whMap.set(wh.name, curCnt + 1);
    const liveState: SoopLiveState = { ...info, assignedWebhookName: wh.name };
    this.map.set(id, liveState);
    return liveState;
  }

  async get(id: string) {
    return this.map.get(id);
  }

  async delete(id: string) {
    const liveState = this.map.get(id);
    if (!liveState) {
      throw Error(`${id} is not found`);
    }
    const curCnt = this.whMap.get(liveState.assignedWebhookName);
    if (curCnt === undefined) {
      throw Error('curCnt is undefined');
    }
    this.whMap.set(liveState.assignedWebhookName, curCnt - 1);
    this.map.delete(id);
    return liveState;
  }

  async all() {
    return Array.from(this.map.values());
  }
}
