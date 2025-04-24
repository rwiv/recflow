import { liveDto } from '@/client/live/live.schema.ts';
import { z } from 'zod';
import { nodeDto } from '@/client/node/node.schema.ts';

export const liveDtoWithNodes = liveDto.extend({
  nodes: z.array(nodeDto).optional(),
});
export type LiveDtoWithNodes = z.infer<typeof liveDtoWithNodes>;
