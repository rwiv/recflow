import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../../channel/priority/priority.repository.js';
import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { dropAll } from '../../infra/db/utils.js';
import { DevInitInjector } from './dev-injector.js';
import {
  CHANNEL_PRIORIES_TIER_MAP,
  CHANNEL_PRIORITIES,
} from '../../channel/priority/priority.constants.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { platformTypeEnum } from '../../platform/platform.schema.js';
import { NodeTypeRepository } from '../../node/persistence/node-type.repository.js';
import { nodeTypeEnum } from '../../node/node.schema.js';
import { NodeGroupRepository } from '../../node/persistence/node-group.repository.js';
import { NODE_TYPES, NODE_TYPES_TIER_MAP } from '../../node/node.constraints.js';
import { NodeWriter } from '../../node/business/node.writer.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';

@Injectable()
export class AppInitializer {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly ntRepo: NodeTypeRepository,
    private readonly ngRepo: NodeGroupRepository,
    private readonly devInjector: DevInitInjector,
  ) {}

  async initProd() {
    await this.checkDb();
  }

  async initDev() {
    await dropAll();
    await this.checkDb();
    await this.devInjector.insertTestChannels();
    await this.devInjector.insertTestNodes();
  }

  async checkDb() {
    const pfNames = (await this.pfRepo.findAll()).map((pf) => pf.name);
    for (const name of platformTypeEnum.options.filter((name) => !pfNames.includes(name))) {
      await this.pfRepo.create(name);
    }

    const cpNames = (await this.priRepo.findAll()).map((pri) => pri.name);
    for (const name of CHANNEL_PRIORITIES.filter((name) => !cpNames.includes(name))) {
      const tier = CHANNEL_PRIORIES_TIER_MAP[name];
      if (tier === undefined) {
        throw new NotFoundError(`tier is undefined for ${name}`);
      }
      await this.priRepo.create(name, tier);
    }

    const nodeTypes = (await this.ntRepo.findAll()).map((nt) => nt.name);
    for (const name of nodeTypeEnum.options.filter((name) => !nodeTypes.includes(name))) {
      await this.ntRepo.create(name);
    }
    const ngNames = (await this.ngRepo.findAll()).map((pri) => pri.name);
    for (const name of NODE_TYPES.filter((name) => !ngNames.includes(name))) {
      const tier = NODE_TYPES_TIER_MAP[name];
      if (tier === undefined) {
        throw new NotFoundError(`tier is undefined for ${name}`);
      }
      await this.ngRepo.create(name, tier);
    }
  }
}
