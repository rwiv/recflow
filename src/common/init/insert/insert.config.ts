import fs from 'fs';
import yaml from 'js-yaml';
import { z } from 'zod';
import { nnint, nonempty } from '../../data/common.schema.js';
import { platformNameEnum } from '../../../platform/spec/storage/platform.enum.schema.js';

const criterionBatchInsert = z.object({
  name: nonempty,
  enforceCreds: z.boolean(),
  sufficientUserCnt: z.number().int().nonnegative(),
  minUserCnt: z.number().int().nonnegative(),
  minFollowCnt: z.number().int().nonnegative(),
});
const chzzkCriterionBatchInsert = criterionBatchInsert.extend({
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveWps: z.array(nonempty),
  negativeWps: z.array(nonempty),
});
export type ChzzkCriterionBatchInsert = z.infer<typeof chzzkCriterionBatchInsert>;
const soopCriterionBatchInsert = criterionBatchInsert.extend({
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveCates: z.array(nonempty),
  negativeCates: z.array(nonempty),
});
export type SoopCriterionBatchInsert = z.infer<typeof soopCriterionBatchInsert>;
const criteriaBatchInsert = z.object({
  chzzk: z.array(chzzkCriterionBatchInsert),
  soop: z.array(soopCriterionBatchInsert),
});
export type CriteriaBatchInsert = z.infer<typeof criteriaBatchInsert>;

const nodeBatchInsert = z.object({
  name: nonempty,
  endpoint: z.string().url(),
  groupName: z.string().nonempty(),
  weight: z.number().int().nonnegative(),
  capacity: nnint,
  isCordoned: z.boolean(),
});
export type NodeBatchInsert = z.infer<typeof nodeBatchInsert>;

const channelBatchInsert = z.object({
  pids: z.array(nonempty),
  platform: platformNameEnum,
});
export type ChannelBatchInsert = z.infer<typeof channelBatchInsert>;

export const batchConfig = z.object({
  channels: z.array(channelBatchInsert),
  nodes: z.array(nodeBatchInsert),
  criteria: criteriaBatchInsert,
});
export type BatchConfig = z.infer<typeof batchConfig>;

export function readBatchConfig(filePath: string): BatchConfig {
  const text = fs.readFileSync(filePath, 'utf-8');
  return batchConfig.parse(yaml.load(text));
}
