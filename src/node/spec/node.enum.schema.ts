import { z } from 'zod';

export const nodeTypeNameEnum = z.enum(['worker', 'argo']);
export type NodeTypeName = z.infer<typeof nodeTypeNameEnum>;
