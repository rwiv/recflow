import { WebhookState } from '../../webhook/types.js';
import { RedisClientType } from 'redis';
import { QueryConfig } from '../../common/query.js';
import { LiveInfo } from '../../platform/live.wrapper.js';
import { PlatformType } from '../../platform/types.js';
import { WebhookCntState } from './types.js';

export const WHC_KEY = 'stdl:targets:whc:';

type WhcMap = { [name: string]: WebhookCntState };

export class WhcRepository {
  constructor(
    private readonly client: RedisClientType,
    private readonly query: QueryConfig,
  ) {}

  clear() {
    return this.client.del(WHC_KEY);
  }

  async updateWebhookCnt(whName: string, type: PlatformType, num: 1 | -1) {
    const whcMap = await this.whcMap();
    const whc = whcMap[whName];
    if (whc === undefined) {
      throw Error('whc is undefined');
    }
    if (type === 'chzzk') {
      whcMap[whName] = {
        chzzk: whc.chzzk + num,
        soop: whc.soop,
      };
    } else {
      whcMap[whName] = {
        chzzk: whc.chzzk,
        soop: whc.soop + num,
      };
    }
    await this.client.set(WHC_KEY, JSON.stringify(whcMap));
  }

  async getWhcMap(): Promise<WhcMap | null> {
    const value = await this.client.get(WHC_KEY);
    if (value) {
      return JSON.parse(value) as WhcMap;
    } else {
      return null;
    }
  }

  async whcMap(): Promise<WhcMap> {
    const whcMap: WhcMap | null = await this.getWhcMap();
    if (whcMap) {
      return this.checkWhc(whcMap);
    } else {
      return this.createNewWhcMap();
    }
  }

  async whcSync(lives: LiveInfo[]) {
    const whcMap: WhcMap = this.newWhcMap();
    if (lives.length === 0) {
      await this.client.set(WHC_KEY, JSON.stringify(whcMap));
      return whcMap;
    }
    for (const live of lives) {
      const whc = whcMap[live.assignedWebhookName];
      if (whc === undefined) {
        throw Error('whc is undefined');
      }
      if (live.type === 'chzzk') {
        whc.chzzk++;
      } else if (live.type === 'soop') {
        whc.soop++;
      } else {
        throw Error('Invalid live type');
      }
    }
    await this.client.set(WHC_KEY, JSON.stringify(whcMap));
    return whcMap;
  }

  async whStates(): Promise<WebhookState[]> {
    const whcMap: WhcMap = await this.whcMap();
    return this.query.webhooks.map((wh) => {
      const whc = whcMap[wh.name];
      if (whc === undefined) throw Error('whc is undefined');
      return {
        ...wh,
        chzzkAssignedCnt: whc.chzzk,
        soopAssignedCnt: whc.soop,
      };
    });
  }

  private async checkWhc(whcMap: WhcMap) {
    let changed = false;
    for (const name of this.query.webhooks.map((wh) => wh.name)) {
      if (whcMap[name] === undefined) {
        whcMap[name] = { chzzk: 0, soop: 0 };
        changed = true;
      }
    }
    if (changed) {
      await this.client.set(WHC_KEY, JSON.stringify(whcMap));
    }
    return whcMap;
  }

  private async createNewWhcMap() {
    const whcMap = this.newWhcMap();
    await this.client.set(WHC_KEY, JSON.stringify(whcMap));
    return whcMap;
  }

  private newWhcMap() {
    const whcMap = {};
    const names = this.query.webhooks.map((wh) => wh.name);
    for (const name of names) {
      whcMap[name] = { chzzk: 0, soop: 0 };
    }
    return whcMap;
  }
}
