import { z } from 'zod';
import { nodeDto } from '../../node/spec/node.dto.schema.js';
import { liveDto } from './live.dto.schema.js';

export const liveDtoMapped = liveDto.extend({
  nodes: z.array(nodeDto).optional(),
});
export type LiveDtoMapped = z.infer<typeof liveDtoMapped>;
