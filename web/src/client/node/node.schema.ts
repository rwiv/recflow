import { z } from 'zod';
import { nonempty, uuid } from '@/common/common.schema.ts';

export const nodeGroupDto = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
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

export const nodeDto = z.object({
  id: uuid,
  name: nonempty,
  endpoint: nonempty,
  priority: z.coerce.number().nonnegative(),
  capacity: z.coerce.number().nonnegative(),
  isCordoned: z.boolean(),
  isDomestic: z.boolean(),
  livesCnt: z.number().int().nonnegative(),
  failureCnt: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
  groupId: uuid,
  group: nodeGroupDto.optional(),
});
export type NodeDto = z.infer<typeof nodeDto>;

export const nodeUpdate = nodeDto
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    group: true,
  })
  .partial();
export type NodeUpdate = z.infer<typeof nodeUpdate>;

export const nodeAppend = nodeDto.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  group: true,
});
export type NodeAppend = z.infer<typeof nodeAppend>;
