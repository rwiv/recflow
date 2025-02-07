import { Inject, Injectable } from '@nestjs/common';
import { NodeRecord } from '../../node/types.js';
import { LiveInfo } from '../../platform/wapper/live.js';
import { NodeService } from './node.service.js';
import type { AsyncMap } from '../../infra/storage/interface.js';
import { LIVE_MAP } from '../persistence/persistence.module.js';
import { LiveRecord } from './types.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveEventListener } from '../event/listener.js';
import { ExitCmd } from '../event/types.js';
import { ChannelWriter } from '../../channel/business/channel.writer.js';
import { NodeSelector } from '../../node/node.selector.js';
import { ChannelInfo } from '../../platform/wapper/channel.js';
import { channelAppendWithInfo } from '../../channel/business/channel.schema.js';
import { ChannelFinder } from '../../channel/business/channel.finder.js';
import { FatalError } from '../../utils/errors/errors/FatalError.js';
import { CHANNEL_PRIORIES_VALUE_MAP } from '../../channel/priority/consts.js';

export interface DeleteOptions {
  purge?: boolean;
  exitCmd?: ExitCmd;
}

export interface FindOptions {
  withDeleted?: boolean;
}

@Injectable()
export class TrackedLiveService {
  constructor(
    @Inject(LIVE_MAP) private readonly liveMap: AsyncMap<string, LiveRecord>,
    private readonly fetcher: PlatformFetcher,
    private readonly listener: LiveEventListener,
    private readonly nodeService: NodeService,
    private readonly nodeSelector: NodeSelector,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
  ) {}

  async get(id: string, opts: FindOptions = {}) {
    let includeDeleted = opts.withDeleted;
    if (includeDeleted === undefined) {
      includeDeleted = false;
    }

    const value = await this.liveMap.get(id);
    if (!value) return undefined;
    if (value.isDeleted && !includeDeleted) return undefined;
    return value;
  }

  async add(live: LiveInfo, channelInfo: ChannelInfo): Promise<LiveRecord> {
    const exists = await this.get(live.channelId);
    if (exists && !exists.isDeleted) {
      throw Error(`Already exists: ${live.channelId}`);
    }
    let channel = await this.chFinder.findByPidOne(live.channelId, live.type);
    if (!channel) {
      const req = channelAppendWithInfo.parse({
        priorityName: CHANNEL_PRIORIES_VALUE_MAP.none,
        followed: false,
      });
      channel = await this.chWriter.createWithChannelInfo(req, channelInfo);
    }
    const node = this.nodeSelector.match(channel, await this.nodes());
    if (node === null) {
      throw new FatalError(`No node matched for ${live.channelId}`);
    }
    const record = {
      ...live,
      savedAt: new Date().toISOString(),
      updatedAt: undefined,
      deletedAt: undefined,
      isDeleted: false,
      assignedWebhookName: node.name,
    };
    await this.liveMap.set(live.channelId, record);
    await this.nodeService.updateCnt(node.name, live.type, 1);
    await this.listener.onCreate(record, node.url);
    return record;
  }

  async update(newRecord: LiveRecord) {
    const exists = await this.get(newRecord.channelId, { withDeleted: true });
    if (!exists) throw Error(`Not found liveRecord: ${newRecord.channelId}`);
    if (exists.assignedWebhookName !== newRecord.assignedWebhookName) {
      await this.nodeService.updateCnt(exists.assignedWebhookName, exists.type, -1);
      await this.nodeService.updateCnt(newRecord.assignedWebhookName, newRecord.type, 1);
    }
    await this.liveMap.set(newRecord.channelId, newRecord);
    return exists;
  }

  async delete(id: string, opts: DeleteOptions = {}) {
    let exitCmd = opts.exitCmd;
    if (exitCmd === undefined) {
      exitCmd = 'delete';
    }
    let purge = opts.purge;
    if (purge === undefined) {
      purge = false;
    }

    const record = await this.get(id, { withDeleted: true });
    if (!record) throw Error(`Not found liveRecord: ${id}`);

    if (!purge) {
      if (record.isDeleted) throw Error(`Already deleted: ${id}`);
      record.isDeleted = true;
      record.deletedAt = new Date().toISOString();
      await this.liveMap.set(id, record);
      await this.nodeService.updateCnt(record.assignedWebhookName, record.type, -1);
    } else {
      if (!record.isDeleted) {
        await this.nodeService.updateCnt(record.assignedWebhookName, record.type, -1);
      }
      await this.liveMap.delete(id);
    }

    await this.listener.onDelete(record, exitCmd);

    return record;
  }

  async purgeAll() {
    const records = await this.findAllDeleted();
    const promises = records.map((it) => this.delete(it.channelId, { purge: true }));
    return Promise.all(promises);
  }

  async findAll() {
    return this.liveMap.values();
  }

  async findAllActives() {
    return (await this.findAll()).filter((it) => !it.isDeleted);
  }

  async findAllDeleted() {
    return (await this.findAll()).filter((it) => it.isDeleted);
  }

  async keys() {
    return this.liveMap.keys();
  }

  async nodes(): Promise<NodeRecord[]> {
    return this.nodeService.values();
  }

  async refreshAllLives() {
    const records = await this.findAllActives();
    const entries = records.map((it) => [it.channelId, it] as const);
    const recordMap = new Map<string, LiveRecord>(entries);

    const fetchPromises = records.map(async (live) => {
      return this.fetcher.fetchChannel(live.type, live.channelId, true);
    });
    const newChannels = (await Promise.all(fetchPromises)).filter((it) => it !== null);

    const promises = newChannels.map(async (channel) => {
      const record = recordMap.get(channel.pid);
      if (!record) throw Error(`Record not found for ${channel.pid}`);
      // 방송이 종료되었으나 cleanup cycle 이전에 refresh가 진행되면
      // record는 active이나 fetchedChannel.liveInfo는 null이 될 수 있다.
      if (!channel.liveInfo) {
        return;
      }
      await this.update({
        ...channel.liveInfo,
        savedAt: record.savedAt,
        updatedAt: new Date().toISOString(),
        deletedAt: record.deletedAt,
        isDeleted: record.isDeleted,
        assignedWebhookName: record.assignedWebhookName,
      });
    });
    return Promise.all(promises);
  }

  async syncNodes() {
    const lives = await this.findAllActives();
    await this.nodeService.synchronize(lives);
  }

  async clear() {
    await this.liveMap.clear();
    await this.nodeService.clear();
  }
}
