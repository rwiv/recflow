import { z } from 'zod';
import { nodeDto } from '@/client/node/node.schema.ts';
import { liveDto } from '@/client/live/live.schema.ts';

export const nodeDtoWithLives = nodeDto.extend({
  lives: z.array(liveDto).optional(),
});
export type NodeDtoWithLives = z.infer<typeof nodeDtoWithLives>;
