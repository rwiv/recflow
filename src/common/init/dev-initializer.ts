import { Inject, Injectable } from '@nestjs/common';
import { dropTables } from '../../infra/db/utils.js';
import { DevChannelInserter } from './insert/insert.channel.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { NodeGroupRepository } from '../../node/storage/node-group.repository.js';
import { CriterionRuleRepository } from '../../criterion/storage/criterion-rule.repository.js';
import { chzzkCriterionRuleNameEnum, soopCriterionRuleNameEnum } from '../../criterion/spec/criterion.rule.schema.js';
import { PriorityService } from '../../channel/service/priority.service.js';
import { PlatformWriter } from '../../platform/storage/platform.writer.js';
import { dropAllKeys } from '../../infra/redis/redis.utils.js';
import { SERVER_REDIS } from '../../infra/infra.tokens.js';
import { RedisStore } from '../../infra/redis/redis.store.js';

@Injectable()
export class DevInitializer {
  constructor(
    private readonly pfWriter: PlatformWriter,
    private readonly priService: PriorityService,
    private readonly ngRepo: NodeGroupRepository,
    private readonly ruleRepo: CriterionRuleRepository,
    private readonly devInjector: DevChannelInserter,
    @Inject(SERVER_REDIS) private readonly redis: RedisStore,
  ) {}

  async initDev() {
    await dropTables();
    await dropAllKeys(this.redis.client);

    await this.addPlatforms();
    await this.addPriorities();
    await this.addNodeGroups();
    await this.addCriterionRules();

    await this.devInjector.insertTestChannels();
    await this.devInjector.insertTestNodes();
  }

  private async addPlatforms() {
    for (const name of platformNameEnum.options) {
      await this.pfWriter.create({ name });
    }
  }

  private async addPriorities() {
    await this.priService.create({ name: 'must', shouldSave: true, tier: 1, seq: 1 });
    await this.priService.create({ name: 'should', shouldSave: true, tier: 1, seq: 2 });
    await this.priService.create({ name: 'common', shouldSave: true, tier: 2, seq: 3 });
    await this.priService.create({ name: 'none', shouldSave: true, tier: 2, seq: 4 });
    await this.priService.create({ name: 'review', shouldSave: false, tier: 3, seq: 5 });
    await this.priService.create({ name: 'skip', shouldSave: false, tier: 3, seq: 6 });
  }

  private async addNodeGroups() {
    await this.ngRepo.create({ name: 'main' });
    await this.ngRepo.create({ name: 'sub' });
    await this.ngRepo.create({ name: 'extra' });
  }

  private async addCriterionRules() {
    for (const ruleName of chzzkCriterionRuleNameEnum.options) {
      await this.ruleRepo.create({ name: ruleName });
    }
    for (const ruleName of soopCriterionRuleNameEnum.options) {
      await this.ruleRepo.create({ name: ruleName });
    }
  }
}
