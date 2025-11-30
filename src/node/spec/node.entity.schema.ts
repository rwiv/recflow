import { z } from 'zod';

import { uuid } from '@/common/data/common.schema.js';

export const nodeEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  endpoint: z.string().nonempty(),
  priority: z.number().int().positive(),
  capacity: z.number().int().nonnegative(),
  isCordoned: z.boolean(),
  isDomestic: z.boolean(),
  groupId: uuid,
  livesCnt: z.number().int().nonnegative(),
  failureCnt: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  lastAssignedAt: z.coerce.date().nullable(),
});
export type NodeEnt = z.infer<typeof nodeEnt>;

// NodeType cannot be changed
export const nodeEntUpdate = nodeEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type NodeEntUpdate = z.infer<typeof nodeEntUpdate>;

export const nodeEntAppend = nodeEnt.partial({
  id: true,
  isCordoned: true,
  description: true,
  livesCnt: true,
  failureCnt: true,
  isDomestic: true,
  createdAt: true,
  updatedAt: true,
  lastAssignedAt: true,
});
export type NodeEntAppend = z.infer<typeof nodeEntAppend>;

export const nodeGroupEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
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

export const liveNodeEnt = z.object({
  liveId: uuid,
  nodeId: uuid,
  createdAt: z.coerce.date(),
});
export type LiveNodeEnt = z.infer<typeof liveNodeEnt>;
export const liveNodeEntAppend = liveNodeEnt.partial({ createdAt: true });
export type LiveNodeEntAppend = z.infer<typeof liveNodeEntAppend>;

export const liveNodeEntUpdate = liveNodeEnt.omit({ liveId: true, nodeId: true });
export type LiveNodeEntUpdate = z.infer<typeof liveNodeEntUpdate>;
