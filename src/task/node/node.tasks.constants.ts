import { z } from 'zod';

export const nodeTaskName = {
  NODE_RESET: 'NODE_RESET',
} as const;
export const nodeTaskNameEnum = z.nativeEnum(nodeTaskName);
export type NodeTaskName = z.infer<typeof nodeTaskNameEnum>;
