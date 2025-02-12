import { z } from 'zod';
import { nonempty, uuid } from '../../common/data/common.schema.js';

export const taskTypeDto = z.object({
  id: uuid,
  name: nonempty,
});

export const taskDto = z.object({
  id: uuid,
  type: taskTypeDto,
  details: nonempty.nullable(),
});

export const periodicTaskDto = z.object({
  id: uuid,
  interval: z.number().int().positive(),
  task: taskDto,
  details: nonempty.nullable(),
});
