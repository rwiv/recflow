import { z } from 'zod';
import { criterionEnt } from '../persistence/criterion.persistence.schema.js';
import { platformRecord } from '../../platform/storage/platform.business.schema.js';

export const CHZZK_CRITERION_RULES = {
  chzzk_tag_name: 'chzzk_tag_name',
  chzzk_keyword_name: 'chzzk_keyword_name',
  chzzk_watch_party_no: 'chzzk_watch_party_no',
};
export const SOOP_CRITERION_RULES = {
  soop_cate_no: 'soop_cate_no',
};

export const chzzkCriterionRuleType = z.enum([
  CHZZK_CRITERION_RULES.chzzk_tag_name,
  CHZZK_CRITERION_RULES.chzzk_keyword_name,
  CHZZK_CRITERION_RULES.chzzk_watch_party_no,
]);
export const soopCriterionRuleType = z.enum([SOOP_CRITERION_RULES.soop_cate_no]);
export type ChzzkCriterionRuleType = z.infer<typeof chzzkCriterionRuleType>;
export type SoopCriterionRuleType = z.infer<typeof soopCriterionRuleType>;

export const liveCriterionRecord = criterionEnt.omit({ platformId: true }).extend({
  platform: platformRecord,
});
export type LiveCriterionRecord = z.infer<typeof liveCriterionRecord>;

export const chzzkCriterionRecord = liveCriterionRecord.extend({
  positiveTags: z.array(z.string().nonempty()),
  negativeTags: z.array(z.string().nonempty()),
  positiveKeywords: z.array(z.string().nonempty()),
  negativeKeywords: z.array(z.string().nonempty()),
  watchPartyNoList: z.array(z.number().int()),
});
export type ChzzkCriterionRecord = z.infer<typeof chzzkCriterionRecord>;

export const soopCriterionRecord = liveCriterionRecord.extend({
  positiveCateNoList: z.array(z.number().int()),
  negativeCateNoList: z.array(z.number().int()),
});
export type SoopCriterionRecord = z.infer<typeof soopCriterionRecord>;
