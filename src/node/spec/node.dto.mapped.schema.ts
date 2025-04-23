import { z } from 'zod';
import { liveDto } from '../../live/spec/live.dto.schema.js';
import { nodeDto } from './node.dto.schema.js';

export const nodeDtoWithLives = nodeDto.extend({
  lives: z.array(liveDto).optional(),
});
export type NodeDtoWithLives = z.infer<typeof nodeDtoWithLives>;
