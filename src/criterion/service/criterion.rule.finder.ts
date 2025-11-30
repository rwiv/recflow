import { Injectable } from '@nestjs/common';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { chzzkCriterionRuleNameEnum, soopCriterionRuleNameEnum } from '@/criterion/spec/criterion.rule.schema.js';
import { CriterionRuleRepository } from '@/criterion/storage/criterion-rule.repository.js';

@Injectable()
export class CriterionRuleFinder {
  constructor(private readonly ruleRepo: CriterionRuleRepository) {}

  async findChzzkRules(tx: Tx = db) {
    const values = chzzkCriterionRuleNameEnum.Values;
    const tagRuleName = values.chzzk_tag_name;
    const keywordRuleName = values.chzzk_keyword_name;
    const wpRuleName = values.chzzk_watch_party_no;
    const tagRule = await this.ruleRepo.findByNameNotNull(tagRuleName, tx);
    const keywordRule = await this.ruleRepo.findByNameNotNull(keywordRuleName, tx);
    const wpRule = await this.ruleRepo.findByNameNotNull(wpRuleName, tx);
    return { tagRule, keywordRule, wpRule };
  }

  async findSoopRules(tx: Tx = db) {
    const values = soopCriterionRuleNameEnum.Values;
    const tagRuleName = values.soop_tag_name;
    const keywordRuleName = values.soop_keyword_name;
    const cateRuleName = values.soop_cate_no;
    const tagRule = await this.ruleRepo.findByNameNotNull(tagRuleName, tx);
    const keywordRule = await this.ruleRepo.findByNameNotNull(keywordRuleName, tx);
    const cateRule = await this.ruleRepo.findByNameNotNull(cateRuleName, tx);
    return { tagRule, keywordRule, cateRule };
  }
}
