import path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { dropTables } from '../../infra/db/utils.js';
import { DevChannelInserter } from './insert/insert.channel.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { NodeGroupRepository } from '../../node/storage/node-group.repository.js';
import { CriterionRuleRepository } from '../../criterion/storage/criterion-rule.repository.js';
import { chzzkCriterionRuleNameEnum, soopCriterionRuleNameEnum } from '../../criterion/spec/criterion.rule.schema.js';
import { DEFAULT_PRIORITY_NAME } from '../../channel/spec/grade.constants.js';
import { GradeService } from '../../channel/service/grade.service.js';
import { PlatformWriter } from '../../platform/storage/platform.writer.js';
import { dropAllKeys } from '../../infra/redis/redis.utils.js';
import { SERVER_REDIS } from '../../infra/infra.tokens.js';
import { RedisStore } from '../../infra/redis/redis.store.js';

@Injectable()
export class DevInitializer {
  constructor(
    private readonly pfWriter: PlatformWriter,
    private readonly grService: GradeService,
    private readonly ngRepo: NodeGroupRepository,
    private readonly ruleRepo: CriterionRuleRepository,
    private readonly devInjector: DevChannelInserter,
    @Inject(SERVER_REDIS) private readonly redis: RedisStore,
  ) {}

  async initDev(withInject: boolean = true) {
    await dropTables();
    await dropAllKeys(this.redis.client);

    await this.addPlatforms();
    await this.addPriorities();
    await this.addNodeGroups();
    await this.addCriterionRules();

    if (withInject) {
      await this.devInjector.insertTestChannels(path.join('dev', 'test_channel_infos.json'));
      await this.devInjector.insertTestNodes(path.join('dev', 'batch_conf.yaml'));
    }
  }

  private async addPlatforms() {
    for (const name of platformNameEnum.options) {
      await this.pfWriter.create({ name });
    }
  }

  private async addPriorities() {
    await this.grService.create({ name: 'great', shouldSave: true, tier: 1, seq: 1 });
    await this.grService.create({ name: 'good', shouldSave: true, tier: 2, seq: 2 });
    await this.grService.create({ name: DEFAULT_PRIORITY_NAME, shouldSave: true, tier: 2, seq: 3 });
    await this.grService.create({ name: 'review', shouldSave: false, tier: 3, seq: 4 });
    await this.grService.create({ name: 'ignore', shouldSave: false, tier: 3, seq: 5 });
  }

  private async addNodeGroups() {
    await this.ngRepo.create({ name: 'group1' });
    await this.ngRepo.create({ name: 'group2' });
    await this.ngRepo.create({ name: 'group3' });
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
