import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../../platform/storage/platform.repository.js';
import { dropAll } from '../../infra/db/utils.js';
import { DevInitInjector } from './dev-injector.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { NodeTypeRepository } from '../../node/storage/node-type.repository.js';
import { nodeTypeNameEnum } from '../../node/spec/node.enum.schema.js';
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
    private readonly ntRepo: NodeTypeRepository,
    private readonly ngRepo: NodeGroupRepository,
    private readonly ruleRepo: CriterionRuleRepository,
    private readonly devInjector: DevInitInjector,
  ) {}

  async initDev() {
    await dropAll();

    await this.addPlatforms();
    await this.addPriorities();
    await this.addNodeTypes();
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
    await this.priService.create({ name: 'must', tier: 1, seq: 1 });
    await this.priService.create({ name: 'should', tier: 1, seq: 2 });
    await this.priService.create({ name: 'may', tier: 2, seq: 3 });
    await this.priService.create({ name: 'review', tier: 3, seq: 4 });
    await this.priService.create({ name: 'skip', tier: 3, seq: 5 });
    await this.priService.create({ name: 'none', tier: 1, seq: 6 });
  }

  private async addNodeTypes() {
    for (const name of nodeTypeNameEnum.options) {
      await this.ntRepo.create({ name });
    }
  }

  private async addNodeGroups() {
    await this.ngRepo.create({ name: 'main', tier: 1 });
    await this.ngRepo.create({ name: 'sub', tier: 2 });
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
