import { z } from 'zod';
import { liveDto } from '@entities/live/api/live.schema.ts';
import { nodeDto } from '@entities/node/node/api/node.schema.ts';

export const liveDtoWithNodes = liveDto.extend({
  nodes: z.array(nodeDto).optional(),
});
export type LiveDtoWithNodes = z.infer<typeof liveDtoWithNodes>;
