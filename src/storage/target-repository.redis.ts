import { TargetRepository } from './types.js';
import { QueryConfig } from '../common/query.js';
import { WebhookState } from '../webhook/types.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV, QUERY } from '../common/common.module.js';
import { LiveInfo, LiveInfoWrapper } from '../platform/wrapper.live.js';
import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from '../common/configs.js';
import { Env } from '../common/env.js';
import { log } from 'jslog';
import { WhcRepository } from './whc-repository.js';

const KEYS_KEY = 'stdl:targets:keys:';
const KEY_PREFIX = 'stdl:targets:live:';

@Injectable()
export class TargetRepositoryRedis implements TargetRepository {
  private client: RedisClientType | undefined = undefined;
  private readonly conf: RedisConfig;
  public readonly whcMap: WhcRepository;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
  ) {
    this.conf = this.env.redis;
    this.whcMap = new WhcRepository(this.getClient(), this.query);
  }

  async clear() {
    const client = this.getClient();
    await Promise.all((await this.keys()).map((key) => client.del(key)));
    await client.del(KEYS_KEY);
    await this.whcMap.clear();
  }

  async keys() {
    return this.getClient().sMembers(KEYS_KEY);
  }

  async whStates(): Promise<WebhookState[]> {
    return this.whcMap.whStates();
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
    await this.whcMap.updateWebhookCnt(wh.name, info.type, 1);

    return info;
  }

  async delete(id: string) {
    const client = this.getClient();
    const live = await this.get(id);
    if (!live) throw Error(`${id} is not found`);

    const key = KEY_PREFIX + id;
    await client.del(key);
    await client.sRem(KEYS_KEY, key);
    await this.whcMap.updateWebhookCnt(live.assignedWebhookName, live.type, -1);

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
    await this.whcMap.whcSync(await this.all());
  }

  private getClient() {
    if (this.client) return this.client;
    throw Error('Redis Client is not initialized');
  }
}
