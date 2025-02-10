import fs from 'fs';
import yaml from 'js-yaml';
import { z } from 'zod';
import { CHANNEL_PRIORITIES } from '../channel/priority.constants.js';
import { nodeTypeEnum } from '../node/node.schema.js';
import { NODE_TYPES } from '../node/node.constraints.js';

const batchNodeInsert = z.object({
  name: z.string().nonempty(),
  endpoint: z.string().url(),
  groupName: z.enum(NODE_TYPES),
  typeName: nodeTypeEnum,
  weight: z.number().nonnegative(),
  totalCapacity: z.number().nonnegative(),
  capacities: z.object({
    chzzk: z.number().nonnegative(),
    soop: z.number().nonnegative(),
    twitch: z.number().nonnegative(),
  }),
});
export type NodeBatchInsert = z.infer<typeof batchNodeInsert>;

const batchChannelInsert = z.object({
  pids: z.array(z.string().nonempty()),
  platform: z.string().nonempty(),
  priority: z.enum(CHANNEL_PRIORITIES),
  tagNames: z.array(z.string().nonempty()),
});
export type ChannelBatchInsert = z.infer<typeof batchChannelInsert>;

export const batchConfig = z.object({
  endpoint: z.string().url(),
  channels: batchChannelInsert,
  nodes: z.array(batchNodeInsert),
});
export type BatchConfig = z.infer<typeof batchConfig>;

export function readBatchConfig(filePath: string): BatchConfig {
  const text = fs.readFileSync(filePath, 'utf-8');
  return batchConfig.parse(yaml.load(text));
}
