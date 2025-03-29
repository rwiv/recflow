import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const nodeEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  endpoint: z.string().nonempty(),
  weight: z.number().int().positive(),
  isCordoned: z.boolean(),
  typeId: uuid,
  groupId: uuid,
  failureCnt: z.number().int().nonnegative(),
  isDomestic: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  lastAssignedAt: z.coerce.date().nullable(),
});
export type NodeEnt = z.infer<typeof nodeEnt>;

// NodeType cannot be changed
export const nodeEntUpdate = nodeEnt
  .omit({ id: true, typeId: true, createdAt: true, updatedAt: true })
  .partial();
export type NodeEntUpdate = z.infer<typeof nodeEntUpdate>;

export const nodeEntAppend = nodeEnt.partial({
  id: true,
  isCordoned: true,
  description: true,
  failureCnt: true,
  isDomestic: true,
  createdAt: true,
  updatedAt: true,
  lastAssignedAt: true,
});
export type NodeEntAppend = z.infer<typeof nodeEntAppend>;

export const nodeTypeEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type NodeTypeEnt = z.infer<typeof nodeTypeEnt>;

export const nodeTypeAppend = nodeTypeEnt.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NodeTypeAppend = z.infer<typeof nodeTypeAppend>;

export const nodeGroupEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  tier: z.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type NodeGroupEnt = z.infer<typeof nodeGroupEnt>;

export const nodeGroupDto = nodeGroupEnt;
export type NodeGroupDto = NodeGroupEnt;

export const nodeGroupEntAppend = nodeGroupEnt.partial({
  id: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});
export type NodeGroupEntAppend = z.infer<typeof nodeGroupAppend>;

export const nodeGroupAppend = nodeGroupEntAppend;
export type NodeGroupAppend = NodeGroupEntAppend;

export const nodeGroupEntUpdate = nodeGroupEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type NodeGroupEntUpdate = z.infer<typeof nodeGroupEntUpdate>;

export const nodeGroupUpdate = nodeGroupEntUpdate;
export type NodeGroupUpdate = NodeGroupEntUpdate;

export const nodeStateEnt = z.object({
  id: uuid,
  nodeId: uuid,
  platformId: uuid,
  capacity: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type NodeStateEnt = z.infer<typeof nodeStateEnt>;

export const nodeStateEntAppend = nodeStateEnt.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NodeStateEntAppend = z.infer<typeof nodeStateEntAppend>;

export const nodeStateEntUpdate = nodeStateEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type NodeStateEntUpdate = z.infer<typeof nodeStateEntUpdate>;
