import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../../channel/priority/priority.repository.js';
import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { dropAll } from '../../infra/db/utils.js';
import { DevInitInjector } from '../helpers/injector.js';
import {
  CHANNEL_PRIORIES_TIER_MAP,
  CHANNEL_PRIORITIES,
} from '../../channel/priority/priority.constants.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { platformTypeEnum } from '../../platform/platform.schema.js';

@Injectable()
export class AppInitializer {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly chWriter: ChannelWriter,
  ) {}

  async initProd() {
    await this.checkDb();
  }

  async initDev() {
    await dropAll();
    await this.checkDb();
    const injector = new DevInitInjector(this.chWriter);
    await injector.insertTestChannels();
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
        throw new NotFoundError(`rank is undefined for ${name}`);
      }
      await this.priRepo.create(name, tier);
    }
  }
}
