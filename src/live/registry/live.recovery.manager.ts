import { Inject, Injectable } from '@nestjs/common';
import { AMQP_HTTP } from '../../infra/infra.module.js';
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
      const { platform, channel } = invalidLive;
      await tx.transaction(async (txx) => {
        if (!invalidLive.nodeId) {
          throw new MissingValueError(`nodeId is missing: ${invalidLive.id}`);
        }
        const node = invalidLive.node;
        if (!node) {
          throw new MissingValueError(`node is missing: ${invalidLive.nodeId}`);
        }

        const channelInfo = await this.fetcher.fetchChannelNotNull(platform.name, channel.pid, true, true);
        if (!channelInfo.liveInfo) {
          log.info(`Delete uncleaned live`, { platform: platform.name, channel: channel.username });
          await this.liveWriter.delete(invalidLive.id, txx);
          return;
        }

        if (invalidLive.disconnectedAt === null) {
          await this.liveWriter.update(invalidLive.id, { disconnectedAt: new Date() }, txx);
          return;
        }

        const threshold = new Date(Date.now() - this.getExtraWaitTimeMs(invalidLive));
        if (invalidLive.disconnectedAt > threshold) {
          return;
        }

        if (node.failureCnt >= this.env.nodeFailureThreshold) {
          await this.nodeUpdater.update(node.id, { failureCnt: 0, isCordoned: true }, txx);
        } else {
          await this.nodeUpdater.update(node.id, { failureCnt: node.failureCnt + 1 }, txx);
        }

        await this.liveWriter.delete(invalidLive.id, txx);

        log.info(`Recovery live`, {
          platform: platform.name,
          channel: channel.username,
          node: invalidLive.node?.name,
        });

        await this.liveRegistrar.add(channelLiveInfo.parse(channelInfo), undefined, [node.id], txx);
      });
    }
  }

  private getExtraWaitTimeMs(invalidLive: LiveDto) {
    let waitTimeMs = 0;
    if (invalidLive.platform.name === platformNameEnum.Values.chzzk) {
      waitTimeMs = this.env.chzzkRecoveryExtraWaitTimeMs;
    } else if (invalidLive.platform.name === platformNameEnum.Values.soop) {
      waitTimeMs = this.env.soopRecoveryExtraWaitTimeMs;
    } else {
      throw new EnumCheckError(`Unsupported platform: ${invalidLive.platform.name}`);
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
