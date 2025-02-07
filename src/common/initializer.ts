import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../channel/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../channel/priority/priority.repository.js';
import { PLATFORM_TYPES } from './enum.consts.js';
import { ChannelWriter } from '../channel/business/channel.writer.js';
import { dropAll } from '../infra/db/utils.js';
import { TestChannelInjector } from '../channel/helpers/injector.js';
import { CHANNEL_PRIORIES_MAP, CHANNEL_PRIORITIES } from '../channel/priority/consts.js';

@Injectable()
export class AppInitializer {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly cpRepo: ChannelPriorityRepository,
    private readonly chWriter: ChannelWriter,
  ) {}

  async initProd() {
    await this.checkDb();
  }

  async initDev() {
    await dropAll();
    await this.checkDb();
    const injector = new TestChannelInjector(this.chWriter);
    await injector.insertTestChannels();
  }

  async checkDb() {
    const pfNames = (await this.pfRepo.findAll()).map((pf) => pf.name);
    for (const name of PLATFORM_TYPES.filter((name) => !pfNames.includes(name))) {
      await this.pfRepo.create(name);
    }
    const cpNames = (await this.cpRepo.findAll()).map((pri) => pri.name);
    for (const name of CHANNEL_PRIORITIES.filter((name) => !cpNames.includes(name))) {
      const rank = CHANNEL_PRIORIES_MAP[name];
      if (rank === undefined) {
        throw new Error(`rank is undefined for ${name}`);
      }
      await this.cpRepo.create(name, rank);
    }
  }
}
