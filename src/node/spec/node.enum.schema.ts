import { z } from 'zod';

export const nodeTypeEnum = z.enum(['worker', 'argo']);
export type NodeTypeEnum = z.infer<typeof nodeTypeEnum>;
