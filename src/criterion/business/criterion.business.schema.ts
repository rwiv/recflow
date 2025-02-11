import { z } from 'zod';
import { criterionEnt } from '../persistence/criterion.persistence.schema.js';
import { platformRecord } from '../../platform/storage/platform.business.schema.js';
import { nonempty, uuid } from '../../common/data/common.schema.js';

export const liveCriterionRecord = criterionEnt.omit({ platformId: true }).extend({
  platform: platformRecord,
});
export type LiveCriterionRecord = z.infer<typeof liveCriterionRecord>;

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

export const chzzkCriterionRecord = liveCriterionRecord.extend({
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveWps: z.array(nonempty),
  negativeWps: z.array(nonempty),
});
export type ChzzkCriterionRecord = z.infer<typeof chzzkCriterionRecord>;

export const chzzkCriterionAppend = chzzkCriterionRecord
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true })
  .extend({ platformId: uuid });

export const soopCriterionRecord = liveCriterionRecord.extend({
  positiveCates: z.array(nonempty),
  negativeCates: z.array(nonempty),
});
export type SoopCriterionRecord = z.infer<typeof soopCriterionRecord>;

export const soopCriterionAppend = soopCriterionRecord
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true })
  .extend({ platformId: uuid });
