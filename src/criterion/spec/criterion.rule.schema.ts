import { z } from 'zod';

export const chzzkCriterionRuleNameEnum = z.enum([
  'chzzk_tag_name',
  'chzzk_keyword_name',
  'chzzk_watch_party_no',
]);
export type ChzzkCriterionRuleName = z.infer<typeof chzzkCriterionRuleNameEnum>;

export const soopCriterionRuleNameEnum = z.enum(['soop_tag_name', 'soop_keyword_name', 'soop_cate_no']);
export type SoopCriterionRuleName = z.infer<typeof soopCriterionRuleNameEnum>;

export const criterionRuleNameUnion = z.union([chzzkCriterionRuleNameEnum, soopCriterionRuleNameEnum]);
export type CriterionRuleName = z.infer<typeof criterionRuleNameUnion>;
