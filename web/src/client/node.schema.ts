import { z } from 'zod';
import { platformDto, platformNameEnum } from '@/client/common.schema.ts';
import { nonempty, uuid } from '@/common/common.schema.ts';

export const nodeTypeNameEnum = z.enum(['worker', 'argo']);
export type NodeTypeName = z.infer<typeof nodeTypeNameEnum>;
const nodeTypeDto = z.object({
  id: z.string(),
  name: nodeTypeNameEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});

const nodeGroupDto = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.number().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type NodeGroupDto = z.infer<typeof nodeGroupDto>;

const nodeStateDto = z.object({
  id: z.string(),
  nodeId: z.string(),
  platform: platformDto,
  capacity: z.number(),
  assigned: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type NodeStateDto = z.infer<typeof nodeStateDto>;

export const nodeDto = z.object({
  id: uuid,
  name: nonempty,
  endpoint: nonempty,
  weight: z.coerce.number().nonnegative(),
  totalCapacity: z.coerce.number().nonnegative(),
  isCordoned: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
  type: nodeTypeDto,
  groupId: uuid,
  group: nodeGroupDto.optional(),
  states: z.array(nodeStateDto).optional(),
});
export type NodeDto = z.infer<typeof nodeDto>;

const capacities = z.array(
  z.object({
    platformName: platformNameEnum,
    capacity: z.number().nonnegative(),
  }),
);
export const nodeAppend = nodeDto
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    group: true,
    states: true,
    type: true,
  })
  .extend({ capacities, typeName: nodeTypeNameEnum });
export type NodeAppend = z.infer<typeof nodeAppend>;
