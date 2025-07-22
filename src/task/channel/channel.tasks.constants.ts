import { TaskDef } from '../spec/task.schema.js';

export const CHANNEL_REFRESH_NAME = 'channel_refresh';
export const CHANNEL_REFRESH_DEF: TaskDef = {
  delay: 2 * 1000,
  ex: 60,
};

export const CHANNEL_CACHE_CHECK_NAME = 'channel_cache_check';
export const CHANNEL_CACHE_CHECK_DEF: TaskDef = {
  delay: 30 * 60 * 1000,
  ex: 40 * 60,
};
