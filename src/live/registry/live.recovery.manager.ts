import { Inject, Injectable } from '@nestjs/common';
import { AMQP_HTTP } from '../../infra/infra.tokens.js';
import { AmqpHttp } from '../../infra/amqp/amqp.interface.js';
import { AMQP_EXIT_QUEUE_PREFIX } from '../../common/data/constants.js';
import { LiveFinder } from '../access/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { MissingValueError } from '../../utils/errors/errors/MissingValueError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveRegistrar } from './live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveWriter } from '../access/live.writer.js';
import { log } from 'jslog';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';

@Injectable()
export class LiveRecoveryManager {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(AMQP_HTTP) private readonly amqpHttp: AmqpHttp,
    private readonly liveFinder: LiveFinder,
    private readonly liveWriter: LiveWriter,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly nodeUpdater: NodeUpdater,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async check(tx: Tx = db) {
    for (const invalidLive of await this.findInvalidLives()) {
      await this.checkOne(invalidLive, tx);
    }
  }

  private async checkOne(live: LiveDto, tx: Tx = db) {
    if (!live.nodeId) {
      throw new MissingValueError(`Live with no node assigned: ${live.id}`);
    }

    if (live.disconnectedAt && live.disconnectedAt > this.getWaitThresholdDate(live)) {
      return;
    }

    const chanInfo = await this.fetcher.fetchChannelWithCheckStream(live.platform.name, live.channel.pid);
    if (!chanInfo.liveInfo) {
      return tx.transaction(async (txx) => {
        const queried = await this.liveFinder.findById(live.id, { forUpdate: true }, txx);
        if (!queried) return;
        await this.liveWriter.delete(queried.id, txx);
        log.info(`Delete uncleaned live`, this.getLiveAttrs(queried));
      });
    }

    if (live.disconnectedAt === null && this.getWaitTimeMs(live) > 0) {
      return tx.transaction(async (txx) => {
        const queried = await this.liveFinder.findById(live.id, { forUpdate: true }, txx);
        if (!queried) return;
        await this.liveWriter.update(queried.id, { disconnectedAt: new Date() }, txx);
        log.info(`Set live.disconnectedAt`, this.getLiveAttrs(queried));
      });
    }

    await tx.transaction(async (txx) => {
      const queried = await this.liveFinder.findById(live.id, { forUpdate: true, withNode: true }, txx);
      if (!queried) return;

      const node = queried.node;
      if (!node) {
        throw new MissingValueError(`live.node is missing: ${live.nodeId}`);
      }

      if (node.failureCnt >= this.env.nodeFailureThreshold) {
        await this.nodeUpdater.update(node.id, { failureCnt: 0, isCordoned: true }, txx);
      } else {
        await this.nodeUpdater.update(node.id, { failureCnt: node.failureCnt + 1 }, txx);
      }

      await this.liveWriter.delete(queried.id, txx);
      log.info(`Recovery live`, this.getLiveAttrs(queried));
      await this.liveRegistrar.add(channelLiveInfo.parse(chanInfo), undefined, [node.id], txx);
    });
  }

  private getLiveAttrs(live: LiveDto) {
    return {
      platform: live.platform.name,
      channel: live.channel.username,
      node: live.node?.name,
    };
  }

  private getWaitThresholdDate(live: LiveDto) {
    return new Date(Date.now() - this.getWaitTimeMs(live));
  }

  private getWaitTimeMs(live: LiveDto) {
    let waitTimeMs = 0;
    if (live.platform.name === platformNameEnum.Values.chzzk) {
      waitTimeMs = this.env.chzzkRecoveryExtraWaitTimeMs;
    } else if (live.platform.name === platformNameEnum.Values.soop) {
      waitTimeMs = this.env.soopRecoveryExtraWaitTimeMs;
    } else {
      throw new EnumCheckError(`Unsupported platform: ${live.platform.name}`);
    }
    return waitTimeMs;
  }

  private async findInvalidLives() {
    const prefix = AMQP_EXIT_QUEUE_PREFIX;
    const queues = await this.amqpHttp.fetchByPattern(`${prefix}.*`);
    const invalidLives: LiveDto[] = [];
    for (const live of await this.liveFinder.findAllActives({ withNode: true })) {
      const queueName = `${prefix}.${live.platform.name}.${live.channel.pid}`;
      if (!queues.find((q) => q.name === queueName)) {
        invalidLives.push(live);
      }
    }
    const threshold = new Date(Date.now() - this.env.liveRecoveryWaitTimeMs);
    return invalidLives.filter((live) => live.createdAt < threshold);
  }
}
