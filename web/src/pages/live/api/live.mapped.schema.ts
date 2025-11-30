import { z } from 'zod';

import { nodeDto } from '@/entities/node/node/model/node.schema.ts';

import { liveDto } from '@/pages/live/api/live.schema.ts';

export const liveDtoWithNodes = liveDto.extend({
  nodes: z.array(nodeDto).optional(),
});
export type LiveDtoWithNodes = z.infer<typeof liveDtoWithNodes>;
