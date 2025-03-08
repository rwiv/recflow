import { z } from 'zod';

export const queueState = z.object({
  name: z.string(),
  state: z.string(),
});
export type QueueState = z.infer<typeof queueState>;
