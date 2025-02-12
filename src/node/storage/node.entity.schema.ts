import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const nodeEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  endpoint: z.string().nonempty(),
  weight: z.number().int().nonnegative(),
  totalCapacity: z.number().int().nonnegative(),
  isCordoned: z.boolean(),
  typeId: uuid,
  groupId: uuid,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type NodeEnt = z.infer<typeof nodeEnt>;

export const nodeEntAppend = nodeEnt.partial({
  id: true,
  isCordoned: true,
  description: true,
  createdAt: true,
  updatedAt: true,
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

export const nodeGroupAppend = nodeGroupEnt.partial({
  id: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});
export type NodeGroupAppend = z.infer<typeof nodeGroupAppend>;

export const nodeStateEnt = z.object({
  id: uuid,
  nodeId: uuid,
  platformId: uuid,
  capacity: z.number().int().nonnegative(),
  assigned: z.number().int().nonnegative(),
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

export const nodeStateEntUpdateForm = nodeStateEnt
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();
export const nodeEntUpdate = z.object({
  id: z.string(),
  form: nodeStateEntUpdateForm,
});
export type NodeStateEntUpdate = z.infer<typeof nodeEntUpdate>;
