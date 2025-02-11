import { z } from 'zod';
import { nodeTypeEnt } from './persistence/node.persistence.schema.js';

export const nodeType = z.enum(['worker', 'argo']);
export type NodeType = z.infer<typeof nodeType>;

export const nodeTypeRecord = nodeTypeEnt;
export type NodeTypeRecord = z.infer<typeof nodeTypeRecord>;
