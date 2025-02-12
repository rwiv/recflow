import { z } from 'zod';
import { nonempty, uuid } from '../../common/data/common.schema.js';

export const taskTypeRecord = z.object({
  id: uuid,
  name: nonempty,
});

export const taskRecord = z.object({
  id: uuid,
  type: taskTypeRecord,
  details: nonempty.nullable(),
});

export const periodicTaskRecord = z.object({
  id: uuid,
  interval: z.number().int().positive(),
  task: taskRecord,
  details: nonempty.nullable(),
});
