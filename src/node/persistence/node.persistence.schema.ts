import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const nodeEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  endpoint: z.string().nonempty(),
  weight: z.number().int().nonnegative(),
  totalCapacity: z.number().int().nonnegative(),
  typeId: uuid,
  groupId: uuid,
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type NodeEnt = z.infer<typeof nodeEnt>;

export const nodeEntAppend = nodeEnt.omit({ id: true, createdAt: true, updatedAt: true });
export type NodeEntAppend = z.infer<typeof nodeEntAppend>;

export const nodeTypeEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type NodeTypeEnt = z.infer<typeof nodeTypeEnt>;

export const nodeGroupEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  tier: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type NodeGroupEnt = z.infer<typeof nodeGroupEnt>;

export const nodeStateEnt = z.object({
  id: uuid,
  nodeId: uuid,
  platformId: uuid,
  capacity: z.number().int().nonnegative(),
  assigned: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type NodeStateEnt = z.infer<typeof nodeStateEnt>;

export const nodeStateEntAppend = nodeStateEnt.omit({ id: true, createdAt: true, updatedAt: true });
export type NodeStateEntAppend = z.infer<typeof nodeStateEntAppend>;

export const nodeStateEntUpdateForm = nodeStateEnt
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();
export const nodeEntUpdate = z.object({
  id: z.string(),
  form: nodeStateEntUpdateForm,
});
export type NodeStateEntUpdate = z.infer<typeof nodeEntUpdate>;
