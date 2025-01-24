import { TargetRepository } from './types.js';
import { QueryConfig } from '../../common/query.js';
import { WebhookState } from '../../webhook/types.js';
import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../../common/common.module.js';
import { LiveInfo } from '../../platform/live.js';
import { PlatformType } from '../../platform/types.js';
import { WebhookCntState } from '../webhook/types.js';

@Injectable()
export class TargetRepositoryMem implements TargetRepository {
  private readonly map: Map<string, LiveInfo> = new Map();
  private readonly whcMap: Map<string, WebhookCntState> = new Map();

  constructor(@Inject(QUERY) private readonly query: QueryConfig) {
    const names = query.webhooks.map((wh) => wh.name);
    for (const name of names) {
      const whcState: WebhookCntState = { chzzk: 0, soop: 0 };
      this.whcMap.set(name, whcState);
    }
  }

  async whStates() {
    const whStates: WebhookState[] = this.query.webhooks.map((wh) => {
      const whcState = this.whcMap.get(wh.name);
      if (whcState === undefined) {
        throw Error('whcState is undefined');
      }
      return {
        ...wh,
        chzzkAssignedCnt: whcState.chzzk,
        soopAssignedCnt: whcState.soop,
      };
    });
    return Promise.resolve(whStates);
  }

  get(id: string) {
    return Promise.resolve(this.map.get(id));
  }

  set(id: string, info: LiveInfo, wh: WebhookState) {
    if (this.map.get(id)) throw Error(`${id} is already exists`);

    this.map.set(id, info);
    this.updateWebhookCnt(wh.name, info.type, 1);
    return Promise.resolve(info);
  }

  delete(id: string) {
    const live = this.map.get(id);
    if (!live) throw Error(`${id} is not found`);

    this.map.delete(id);
    if (!live.assignedWebhookName) {
      throw Error('live.assignedWebhookName is undefined');
    }
    this.updateWebhookCnt(live.assignedWebhookName, live.type, -1);
    return Promise.resolve(live);
  }

  all() {
    return Promise.resolve(Array.from(this.map.values()));
  }

  async allChzzk(): Promise<LiveInfo[]> {
    return (await this.all()).filter((info) => info.type === 'chzzk');
  }

  async allSoop(): Promise<LiveInfo[]> {
    return (await this.all()).filter((info) => info.type === 'soop');
  }

  private updateWebhookCnt(whName: string, type: PlatformType, num: 1 | -1) {
    const whc = this.whcMap.get(whName);
    if (whc === undefined) {
      throw Error('whc is undefined');
    }
    if (type === 'chzzk') {
      this.whcMap.set(whName, {
        chzzk: whc.chzzk + num,
        soop: whc.soop,
      });
    } else {
      this.whcMap.set(whName, {
        chzzk: whc.chzzk,
        soop: whc.soop + num,
      });
    }
  }
}
