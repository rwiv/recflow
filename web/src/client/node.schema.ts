import { z } from 'zod';
import { platformRecord, platformEnum } from '@/client/common.schema.ts';

export const nodeTypeEnum = z.enum(['worker', 'argo']);
const nodeTypeRecord = z.object({
  id: z.string(),
  name: nodeTypeEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});

const nodeGroup = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.number().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type NodeGroup = z.infer<typeof nodeGroup>;

const nodeState = z.object({
  id: z.string(),
  nodeId: z.string(),
  platform: platformRecord,
  capacity: z.number(),
  assigned: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type NodeState = z.infer<typeof nodeState>;

export const nodeRecord = z.object({
  id: z.string().length(32),
  name: z.string().nonempty(),
  endpoint: z.string().nonempty(),
  weight: z.coerce.number().nonnegative(),
  totalCapacity: z.coerce.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
  type: nodeTypeRecord,
  groupId: z.string().length(32),
  group: nodeGroup.optional(),
  states: z.array(nodeState).optional(),
});
export type NodeRecord = z.infer<typeof nodeRecord>;

const capacities = z.array(
  z.object({
    platformName: platformEnum,
    capacity: z.number().nonnegative(),
  }),
);
export const nodeAppend = nodeRecord
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    group: true,
    states: true,
  })
  .extend({ capacities });
export type NodeAppend = z.infer<typeof nodeAppend>;
