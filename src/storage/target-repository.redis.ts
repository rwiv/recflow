import { TargetRepository, WebhookCntState } from './types.js';
import { QueryConfig } from '../common/query.js';
import { WebhookState } from '../webhook/types.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV, QUERY } from '../common/common.module.js';
import { LiveInfo, LiveInfoWrapper } from '../platform/wrapper.live.js';
import { PlatformType } from '../platform/common.js';
import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from '../common/configs.js';
import { Env } from '../common/env.js';
import { log } from 'jslog';

const WHC_KEY = 'stdl:targets:whc:';
const KEYS_KEY = 'stdl:targets:keys:';
const KEY_PREFIX = 'stdl:targets:live:';

type WhcMap = { [name: string]: WebhookCntState };

@Injectable()
export class TargetRepositoryRedis implements TargetRepository {
  private client: RedisClientType | undefined = undefined;
  private readonly conf: RedisConfig;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
  ) {
    this.conf = this.env.redis;
  }

  async clear() {
    const client = this.getClient();
    await Promise.all((await this.keys()).map((key) => client.del(key)));
    await client.del(KEYS_KEY);
    await client.del(WHC_KEY);
  }

  async keys() {
    return this.getClient().sMembers(KEYS_KEY);
  }

  async getWhcMap(): Promise<WhcMap | null> {
    const value = await this.getClient().get(WHC_KEY);
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

  async get(id: string) {
    const client = this.getClient();
    const value = await client.get(KEY_PREFIX + id);
    if (!value) return undefined;
    return LiveInfoWrapper.fromObject(JSON.parse(value));
  }

  async set(id: string, info: LiveInfo, wh: WebhookState) {
    const client = this.getClient();
    const key = KEY_PREFIX + id;
    if (await client.get(key)) throw Error(`${id} is already exists`);

    info.assignedWebhookName = wh.name;
    await client.set(key, JSON.stringify(info));
    await client.sAdd(KEYS_KEY, key);
    await this.updateWebhookCnt(wh.name, info.type, 1);

    return info;
  }

  async delete(id: string) {
    const client = this.getClient();
    const live = await this.get(id);
    if (!live) throw Error(`${id} is not found`);

    const key = KEY_PREFIX + id;
    await client.del(key);
    await client.sRem(KEYS_KEY, key);
    await this.updateWebhookCnt(live.assignedWebhookName, live.type, -1);

    return live;
  }

  async all() {
    const promises = (await this.keys()).map((key) =>
      this.get(key.replace(KEY_PREFIX, '')),
    );
    return Promise.all(promises);
  }

  async allChzzk(): Promise<LiveInfo[]> {
    return (await this.all()).filter((info) => info.type === 'chzzk');
  }

  async allSoop(): Promise<LiveInfo[]> {
    return (await this.all()).filter((info) => info.type === 'soop');
  }

  async init() {
    const url = `redis://${this.conf.host}:${this.conf.port}`;
    const client = await createClient({ url, password: this.conf.password })
      .on('error', (err) => console.error('Redis Client Error', err))
      .connect();
    log.info('Redis Client Connected');
    this.client = client as RedisClientType;
  }

  private getClient() {
    if (this.client) return this.client;
    throw Error('Redis Client is not initialized');
  }

  private async updateWebhookCnt(
    whName: string,
    type: PlatformType,
    num: 1 | -1,
  ) {
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
    await this.getClient().set(WHC_KEY, JSON.stringify(whcMap));
  }

  private async checkWhc(whcMap: WhcMap) {
    const client = this.getClient();
    let changed = false;
    for (const name of this.query.webhooks.map((wh) => wh.name)) {
      if (whcMap[name] === undefined) {
        whcMap[name] = { chzzk: 0, soop: 0 };
        changed = true;
      }
    }
    if (changed) {
      await client.set(WHC_KEY, JSON.stringify(whcMap));
    }
    return whcMap;
  }

  private async createNewWhcMap() {
    const whcMap = {};
    const names = this.query.webhooks.map((wh) => wh.name);
    for (const name of names) {
      whcMap[name] = { chzzk: 0, soop: 0 };
    }
    await this.getClient().set(WHC_KEY, JSON.stringify(whcMap));
    return whcMap;
  }
}
