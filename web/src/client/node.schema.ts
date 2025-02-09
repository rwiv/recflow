import { z } from 'zod';

export const nodeTypeEnum = z.enum(['worker', 'argo']);

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
  platformId: z.string(),
  capacity: z.number(),
  assigned: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type NodeState = z.infer<typeof nodeState>;

export const nodeRecord = z.object({
  id: z.string(),
  name: z.string(),
  endpoint: z.string(),
  weight: z.number(),
  totalCapacity: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
  typeName: nodeTypeEnum,
  groupId: z.string(),
  group: nodeGroup.optional(),
  states: z.array(nodeState).optional(),
});
export type NodeRecord = z.infer<typeof nodeRecord>;

const capacities = z.array(
  z.object({
    platformName: z.string().nonempty(),
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
