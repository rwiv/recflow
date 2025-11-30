import { z } from 'zod';
import { nonempty, uuid } from '@/shared/lib/schema/schema_common';
import { nodeGroupDto } from '@/entities/node/group/api/node-group.schema.ts';

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
