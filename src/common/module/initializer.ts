import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../../platform/storage/platform.repository.js';
import { ChannelPriorityRepository } from '../../channel/channel/persistence/priority.repository.js';
import { dropAll } from '../../infra/db/utils.js';
import { DevInitInjector } from './dev-injector.js';
import { CHANNEL_PRIORIES_TIER_MAP, CHANNEL_PRIORITIES } from '../../channel/priority.constants.js';
import { platformType } from '../../platform/storage/platform.business.schema.js';
import { NodeTypeRepository } from '../../node/persistence/node-type.repository.js';
import { nodeType } from '../../node/node.schema.js';
import { NodeGroupRepository } from '../../node/persistence/node-group.repository.js';
import { NODE_TYPES, NODE_TYPES_TIER_MAP } from '../../node/node.constraints.js';
import { PriorityEntAppend } from '../../channel/channel/persistence/priority.schema.js';
import { NodeGroupAppend } from '../../node/persistence/node.persistence.schema.js';
import { MissingValueError } from '../../utils/errors/errors/MissingValueError.js';
import { CriterionRuleRepository } from '../../criterion/persistence/criterion-rule.repository.js';
import {
  chzzkCriterionRuleType,
  soopCriterionRuleType,
} from '../../criterion/business/criterion.rule.schema.js';

@Injectable()
export class AppInitializer {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly ntRepo: NodeTypeRepository,
    private readonly ngRepo: NodeGroupRepository,
    private readonly ruleRepo: CriterionRuleRepository,
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
    for (const name of platformType.options.filter((name) => !pfNames.includes(name))) {
      await this.pfRepo.create({ name });
    }

    const cpNames = (await this.priRepo.findAll()).map((pri) => pri.name);
    for (const name of CHANNEL_PRIORITIES.filter((name) => !cpNames.includes(name))) {
      const tier = CHANNEL_PRIORIES_TIER_MAP[name];
      if (tier === undefined) {
        throw new MissingValueError(`tier is undefined for ${name}`);
      }
      const append: PriorityEntAppend = { name: name as string, tier };
      await this.priRepo.create(append);
    }

    const nodeTypes = (await this.ntRepo.findAll()).map((nt) => nt.name);
    for (const name of nodeType.options.filter((name) => !nodeTypes.includes(name))) {
      await this.ntRepo.create({ name });
    }
    const ngNames = (await this.ngRepo.findAll()).map((pri) => pri.name);
    for (const name of NODE_TYPES.filter((name) => !ngNames.includes(name))) {
      const tier = NODE_TYPES_TIER_MAP[name];
      if (tier === undefined) {
        throw new MissingValueError(`tier is undefined for ${name}`);
      }
      const append: NodeGroupAppend = { name, tier };
      await this.ngRepo.create(append);
    }

    const ruleNames = (await this.ruleRepo.findAll()).map((rule) => rule.name);
    const notExistsChzzk = chzzkCriterionRuleType.options.filter(
      (name) => !ruleNames.includes(name),
    );
    for (const ruleName of notExistsChzzk) {
      await this.ruleRepo.create({ name: ruleName });
    }
    const notExistsSoop = soopCriterionRuleType.options.filter((name) => !ruleNames.includes(name));
    for (const ruleName of notExistsSoop) {
      await this.ruleRepo.create({ name: ruleName });
    }
  }
}
