import { z } from 'zod';
import { platformDto, platformNameEnum } from '@/client/common/platform.schema.ts';
import { nonempty, uuid } from '@/common/common.schema.ts';

export const nodeTypeNameEnum = z.enum(['worker', 'argo']);
export type NodeTypeName = z.infer<typeof nodeTypeNameEnum>;
const nodeTypeDto = z.object({
  id: z.string(),
  name: nodeTypeNameEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});

export const nodeGroupDto = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  tier: z.coerce.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type NodeGroupDto = z.infer<typeof nodeGroupDto>;

export const nodeGroupAppend = nodeGroupDto.partial({
  id: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});
export type NodeGroupAppend = z.infer<typeof nodeGroupAppend>;

export const nodeGroupUpdate = nodeGroupDto.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type NodeGroupUpdate = z.infer<typeof nodeGroupUpdate>;

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
  isCordoned: z.boolean(),
  isDomestic: z.boolean(),
  failureCnt: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
  type: nodeTypeDto,
  groupId: uuid,
  group: nodeGroupDto.optional(),
  states: z.array(nodeStateDto).optional(),
});
export type NodeDto = z.infer<typeof nodeDto>;

const nodeCapacity = z.object({
  platformId: uuid,
  capacity: z.number().int().nonnegative(),
});
export type NodeCapacity = z.infer<typeof nodeCapacity>;
// NodeType cannot be changed
export const nodeUpdate = nodeDto
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    type: true,
    group: true,
    states: true,
  })
  .extend({ capacity: nodeCapacity })
  .partial();
export type NodeUpdate = z.infer<typeof nodeUpdate>;

export const nodeCapacities = z.array(
  z.object({
    platformName: platformNameEnum,
    capacity: z.number().nonnegative(),
  }),
);
export type NodeCapacities = z.infer<typeof nodeCapacities>;
export const nodeAppend = nodeDto
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    group: true,
    states: true,
    type: true,
  })
  .extend({ capacities: nodeCapacities, typeName: nodeTypeNameEnum });
export type NodeAppend = z.infer<typeof nodeAppend>;
