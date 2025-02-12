import { z } from 'zod';

export const CHZZK_CRITERION_RULES = {
  chzzk_tag_name: 'chzzk_tag_name',
  chzzk_keyword_name: 'chzzk_keyword_name',
  chzzk_watch_party_no: 'chzzk_watch_party_no',
};
export const SOOP_CRITERION_RULES = {
  soop_cate_no: 'soop_cate_no',
};

export const chzzkCriterionRuleType = z.enum([
  'chzzk_tag_name',
  'chzzk_keyword_name',
  'chzzk_watch_party_no',
]);
export const soopCriterionRuleType = z.enum(['soop_cate_no']);
export type ChzzkCriterionRuleType = z.infer<typeof chzzkCriterionRuleType>;
export type SoopCriterionRuleType = z.infer<typeof soopCriterionRuleType>;
export const criterionRuleType = z.union([chzzkCriterionRuleType, soopCriterionRuleType]);
export type CriterionRuleType = z.infer<typeof criterionRuleType>;
