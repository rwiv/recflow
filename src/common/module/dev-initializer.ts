import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../../platform/storage/platform.repository.js';
import { dropAll } from '../../infra/db/utils.js';
import { DevInitInjector } from './dev-injector.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { NodeGroupRepository } from '../../node/storage/node-group.repository.js';
import { CriterionRuleRepository } from '../../criterion/storage/criterion-rule.repository.js';
import {
  chzzkCriterionRuleNameEnum,
  soopCriterionRuleNameEnum,
} from '../../criterion/spec/criterion.rule.schema.js';
import { PriorityService } from '../../channel/service/priority.service.js';

@Injectable()
export class DevInitializer {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly priService: PriorityService,
    private readonly ngRepo: NodeGroupRepository,
    private readonly ruleRepo: CriterionRuleRepository,
    private readonly devInjector: DevInitInjector,
  ) {}

  async initDev() {
    await dropAll();

    await this.addPlatforms();
    await this.addPriorities();
    await this.addNodeGroups();
    await this.addCriterionRules();

    await this.devInjector.insertTestChannels();
    await this.devInjector.insertTestNodes();
  }

  private async addPlatforms() {
    for (const name of platformNameEnum.options) {
      await this.pfRepo.create({ name });
    }
  }

  private async addPriorities() {
    await this.priService.create({ name: 'must', shouldSave: true, seq: 1 });
    await this.priService.create({ name: 'should', shouldSave: true, seq: 2 });
    await this.priService.create({ name: 'common', shouldSave: true, seq: 3 });
    await this.priService.create({ name: 'review', shouldSave: false, seq: 4 });
    await this.priService.create({ name: 'skip', shouldSave: false, seq: 5 });
    await this.priService.create({ name: 'none', shouldSave: false, seq: 6 });
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
