import { z } from 'zod';
import { nodeTypeEnt } from './persistence/node.persistence.schema.js';

export const nodeTypeEnum = z.enum(['worker', 'argo']);
export type NodeType = z.infer<typeof nodeTypeEnum>;

export const nodeTypeRecord = nodeTypeEnt;
export type NodeTypeRecord = z.infer<typeof nodeTypeRecord>;
