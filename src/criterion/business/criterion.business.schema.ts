import { z } from 'zod';
import { liveCriterionEnt } from '../persistence/criterion.persistence.schema.js';
import { platformRecord } from '../../platform/platform.schema.js';

export const chzzkCriterionRuleType = z.enum([
  'chzzk_tag_name',
  'chzzk_keyword_name',
  'chzzk_watch_party_no',
]);
export const soopCriterionRuleType = z.enum(['soop_cate_no']);
export type ChzzkCriterionRuleType = z.infer<typeof chzzkCriterionRuleType>;
export type SoopCriterionRuleType = z.infer<typeof soopCriterionRuleType>;

export const liveCriterionRecord = liveCriterionEnt.omit({ platformId: true }).extend({
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
