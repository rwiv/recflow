import { z } from 'zod';
import { nodeDto } from '@entities/node/node';
import { liveDto } from '@entities/live';

export const liveDtoWithNodes = liveDto.extend({
  nodes: z.array(nodeDto).optional(),
});
export type LiveDtoWithNodes = z.infer<typeof liveDtoWithNodes>;
