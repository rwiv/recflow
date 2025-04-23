import { z } from 'zod';
import { nodeDto } from '../../node/spec/node.dto.schema.js';
import { liveDto } from './live.dto.schema.js';

export const liveDtoWithNodes = liveDto.extend({
  nodes: z.array(nodeDto).optional(),
});
export type LiveDtoWithNodes = z.infer<typeof liveDtoWithNodes>;
