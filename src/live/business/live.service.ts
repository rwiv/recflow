import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/wapper/live.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveEventListener } from '../event/listener.js';
import { ExitCmd } from '../event/event.schema.js';
import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { NodeSelector } from '../../node/business/node.selector.js';
import { ChannelInfo } from '../../platform/wapper/channel.js';
import { ChannelAppendWithInfo } from '../../channel/channel/business/channel.business.schema.js';
import { ChannelFinder } from '../../channel/channel/business/channel.finder.js';
import { FatalError } from '../../utils/errors/errors/FatalError.js';
import { CHANNEL_PRIORIES_VALUE_MAP } from '../../channel/priority.constants.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeUpdater } from '../../node/business/node.updater.js';
import { LiveWriter } from './live.writer.js';
import { LiveRecord, LiveUpdate } from './live.business.schema.js';
import { LiveFinder } from './live.finder.js';

export interface DeleteOptions {
  purge?: boolean;
  exitCmd?: ExitCmd;
}

@Injectable()
export class LiveService {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly listener: LiveEventListener,
    private readonly nodeUpdater: NodeUpdater,
    private readonly nodeSelector: NodeSelector,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
  ) {}

  async add(liveInfo: LiveInfo, channelInfo: ChannelInfo) {
    const exists = await this.liveFinder.findByPid(liveInfo.pid);
    if (exists && !exists.isDeleted) {
      throw new ConflictError(`Already exists: ${liveInfo.pid}`);
    }
    let channel = await this.chFinder.findByPidOne(liveInfo.pid, liveInfo.type);
    if (!channel) {
      const append: ChannelAppendWithInfo = {
        // TODO: update
        priorityName: CHANNEL_PRIORIES_VALUE_MAP.none,
        followed: false,
      };
      channel = await this.chWriter.createWithInfo(append, channelInfo);
    }
    const node = await this.nodeSelector.match(channel);
    if (node === null) {
      throw new FatalError(`No node matched for ${liveInfo.pid}`);
    }
    const created = await this.liveWriter.createByLive(liveInfo, node.id);
    await this.nodeUpdater.updateCnt(node.id, channel.platform.id, 1);
    await this.listener.onCreate(created, node.endpoint);
    return created;
  }

  async delete(recordId: string, opts: DeleteOptions = {}) {
    let exitCmd = opts.exitCmd;
    if (exitCmd === undefined) {
      exitCmd = 'delete';
    }
    let purge = opts.purge;
    if (purge === undefined) {
      purge = false;
    }

    const record = await this.liveFinder.findById(recordId, { withDeleted: true });
    if (!record) throw NotFoundError.from('LiveRecord', 'id', recordId);

    if (!purge) {
      if (record.isDeleted) throw new ConflictError(`Already deleted: ${recordId}`);
      const update: LiveUpdate = {
        id: record.id,
        form: { isDeleted: true, deletedAt: new Date() },
      };
      await this.liveWriter.update(update);
      await this.nodeUpdater.updateCnt(record.nodeId, record.platform.id, -1);
    } else {
      if (!record.isDeleted) {
        await this.nodeUpdater.updateCnt(record.nodeId, record.platform.id, -1);
      }
      await this.liveWriter.delete(recordId);
    }

    await this.listener.onDelete(record, exitCmd);

    return record;
  }

  async purgeAll() {
    const records = await this.liveFinder.findAllDeleted();
    const promises = records.map((record) => this.delete(record.id, { purge: true }));
    return Promise.all(promises);
  }

  async refreshAllLives() {
    const records = await this.liveFinder.findAllActives();
    const entries = records.map((it) => [it.channel.pid, it] as const);
    const liveMap = new Map<string, LiveRecord>(entries);

    const fetchPromises = records.map(async (live) => {
      return this.fetcher.fetchChannel(live.platform.name, live.channel.pid, true);
    });
    const newChannels = (await Promise.all(fetchPromises)).filter((it) => it !== null);

    const promises = newChannels.map(async (channel) => {
      const record = liveMap.get(channel.pid);
      if (!record) throw Error(`Record not found for ${channel.pid}`);
      // 방송이 종료되었으나 cleanup cycle 이전에 refresh가 진행되면
      // record는 active이나 fetchedChannel.liveInfo는 null이 될 수 있다.
      if (!channel.liveInfo) {
        return;
      }
      await this.liveWriter.updateByLive(record.id, channel.liveInfo);
    });
    return Promise.all(promises);
  }
}
