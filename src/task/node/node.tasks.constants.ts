import { TaskDef } from '@/task/spec/task.schema.js';

export const NODE_RESET_NAME = 'node_reset';
export const NODE_RESET_DEF: TaskDef = { delay: 12 * 60 * 60 * 1000, ex: 12 * 60 * 60 + 60 };

export const NODE_LIVES_CHECK_NAME = 'node_lives_check';
export const NODE_LIVES_CHECK_DEF: TaskDef = { delay: 10 * 1000, ex: 60 };

export const NODE_DRAIN_NAME = 'node_drain';
