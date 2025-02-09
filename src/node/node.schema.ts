import { z } from 'zod';

export const nodeTypeEnum = z.enum(['worker', 'argo']);
export type NodeType = z.infer<typeof nodeTypeEnum>;
