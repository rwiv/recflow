import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { CriterionRuleRepository } from '../persistence/criterion-rule.repository.js';
import { CHZZK_CRITERION_RULES, SOOP_CRITERION_RULES } from './criterion.rule.schema.js';

@Injectable()
export class CriterionRuleService {
  constructor(private readonly ruleRepo: CriterionRuleRepository) {}

  async findChzzkRules(tx: Tx = db) {
    const tagRuleName = CHZZK_CRITERION_RULES.chzzk_tag_name;
    const keywordRuleName = CHZZK_CRITERION_RULES.chzzk_keyword_name;
    const wpRuleName = CHZZK_CRITERION_RULES.chzzk_watch_party_no;
    const tagRule = await this.ruleRepo.findByNameNotNull(tagRuleName, tx);
    const keywordRule = await this.ruleRepo.findByNameNotNull(keywordRuleName, tx);
    const wpRule = await this.ruleRepo.findByNameNotNull(wpRuleName, tx);
    return { tagRule, keywordRule, wpRule };
  }

  async findSoopRules(tx: Tx = db) {
    const cateRuleName = SOOP_CRITERION_RULES.soop_cate_no;
    const cateRule = await this.ruleRepo.findByNameNotNull(cateRuleName, tx);
    return { cateRule };
  }
}
