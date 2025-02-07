import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../channel/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../channel/persistence/priority.repository.js';
import { CHANNEL_PRIORITIES } from '../../web/src/common/enum.consts.js';
import { PLATFORM_TYPES } from './enum.consts.js';
import { ChannelWriter } from '../channel/business/channel.writer.js';
import { dropAll } from '../infra/db/utils.js';
import { TestChannelInjector } from '../channel/helpers/injector.js';

@Injectable()
export class AppInitializer {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly cpRepo: ChannelPriorityRepository,
    private readonly chWriter: ChannelWriter,
  ) {}

  private async checkDb() {
    const pfNames = (await this.pfRepo.findAll()).map((pf) => pf.name);
    for (const name of PLATFORM_TYPES.filter((name) => !pfNames.includes(name))) {
      // console.log(name)
      await this.pfRepo.create(name);
    }
    const cpNames = (await this.pfRepo.findAll()).map((pri) => pri.name);
    for (const name of CHANNEL_PRIORITIES.filter((name) => !cpNames.includes(name))) {
      // console.log(name)
      await this.cpRepo.create(name);
    }
  }

  async initProd() {
    await this.initDev();
  }

  async initDev() {
    await dropAll();
    await this.checkDb();
    const injector = new TestChannelInjector(this.chWriter);
    await injector.insertTestChannels();
  }
}
