import { z } from 'zod';

import { nodeDto } from '@/node/spec/node.dto.schema.js';

import { liveDto } from '@/live/spec/live.dto.schema.js';

export const nodeDtoMapped = nodeDto.extend({
  lives: z.array(liveDto).optional(),
});
export type NodeDtoMapped = z.infer<typeof nodeDtoMapped>;
