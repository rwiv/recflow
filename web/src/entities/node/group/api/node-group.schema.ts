import { z } from 'zod';
import { uuid } from '@shared/lib/schema/schema_common';

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
