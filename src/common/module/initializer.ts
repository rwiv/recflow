import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../../platform/storage/platform.repository.js';
import { dropAll } from '../../infra/db/utils.js';
import { DevInitInjector } from './dev-injector.js';
import {
  CHANNEL_PRIORIES_SEQ_MAP,
  CHANNEL_PRIORIES_TIER_MAP,
  CHANNEL_PRIORITIES,
} from '../../channel/spec/default.priority.constants.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { NodeTypeRepository } from '../../node/storage/node-type.repository.js';
import { nodeTypeNameEnum } from '../../node/spec/node.enum.schema.js';
import { NodeGroupRepository } from '../../node/storage/node-group.repository.js';
import { NODE_TYPES, NODE_TYPES_TIER_MAP } from '../../node/spec/default.node.constants.js';
import { PriorityEntAppend } from '../../channel/spec/priority.schema.js';
import { NodeGroupAppend } from '../../node/spec/node.entity.schema.js';
import { MissingValueError } from '../../utils/errors/errors/MissingValueError.js';
import { CriterionRuleRepository } from '../../criterion/storage/criterion-rule.repository.js';
import {
  chzzkCriterionRuleNameEnum,
  soopCriterionRuleNameEnum,
} from '../../criterion/spec/criterion.rule.schema.js';
import { PriorityService } from '../../channel/service/priority.service.js';

@Injectable()
export class AppInitializer {
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
    await this.checkDb();
    await this.devInjector.insertTestChannels();
    await this.devInjector.insertTestNodes();
  }

  async checkDb() {
    const pfNames = (await this.pfRepo.findAll()).map((pf) => pf.name);
    for (const name of platformNameEnum.options.filter((name) => !pfNames.includes(name))) {
      await this.pfRepo.create({ name });
    }

    const cpNames = (await this.priService.findAll()).map((pri) => pri.name);
    for (const name of CHANNEL_PRIORITIES.filter((name) => !cpNames.includes(name))) {
      const tier = CHANNEL_PRIORIES_TIER_MAP[name];
      if (tier === undefined) {
        throw new MissingValueError(`tier is undefined for ${name}`);
      }
      const seq = CHANNEL_PRIORIES_SEQ_MAP[name];
      if (seq === undefined) {
        throw new MissingValueError(`seq is undefined for ${name}`);
      }
      const append: PriorityEntAppend = { name: name as string, tier, seq };
      await this.priService.create(append);
    }

    const nodeTypes = (await this.ntRepo.findAll()).map((nt) => nt.name);
    for (const name of nodeTypeNameEnum.options.filter((name) => !nodeTypes.includes(name))) {
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
    const notExistsChzzk = chzzkCriterionRuleNameEnum.options.filter((name) => !ruleNames.includes(name));
    for (const ruleName of notExistsChzzk) {
      await this.ruleRepo.create({ name: ruleName });
    }
    const notExistsSoop = soopCriterionRuleNameEnum.options.filter((name) => !ruleNames.includes(name));
    for (const ruleName of notExistsSoop) {
      await this.ruleRepo.create({ name: ruleName });
    }
  }
}
