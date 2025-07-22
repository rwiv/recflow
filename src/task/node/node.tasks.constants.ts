import { TaskDef } from '../spec/task.schema.js';

export const NODE_RESET_NAME = 'node_reset';
export const NODE_RESET: TaskDef = {
  delay: 12 * 60 * 60 * 1000,
  ex: 12 * 60 * 60 + 60,
};
