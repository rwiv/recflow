import { TaskDef } from '../spec/task.schema.js';

export const LIVE_REGISTER_CRITERION_NAME = 'live_register_criterion';
export const LIVE_REGISTER_CRITERION_DEF: TaskDef = { delay: 5 * 1000, ex: 2 * 60 };

export const LIVE_REGISTER_FOLLOWED_NAME = 'live_register_followed';
export const LIVE_REGISTER_FOLLOWED_DEF: TaskDef = { delay: 5 * 1000, ex: 2 * 60 };

export const LIVE_CLEANUP_NAME = 'live_cleanup';
export const LIVE_CLEANUP_DEF: TaskDef = { delay: 5 * 1000, ex: 60 };

export const LIVE_REFRESH_NAME = 'live_refresh';
export const LIVE_REFRESH_DEF: TaskDef = { delay: 2 * 1000, ex: 60 };

export const LIVE_RECOVERY_NAME = 'live_recovery';
export const LIVE_RECOVERY_DEF: TaskDef = { delay: 1000, ex: 60 };

export const LIVE_STATE_CLEANUP_NAME = 'live_state_cleanup';
export const LIVE_STATE_CLEANUP_DEF: TaskDef = { delay: 1000, ex: 60 };

export const LIVE_ALLOCATION_NAME = 'live_allocation';
export const LIVE_ALLOCATION_DEF: TaskDef = { delay: 1000, ex: 60 };

export const LIVE_FINISH_NAME = 'live_finish';

export const LIVE_STREAM_DETECTION_NAME = 'live_stream_detection';
export const LIVE_STREAM_DETECTION_DEF: TaskDef = { delay: 1000, ex: 60 };

export const LIVE_STREAM_AUDIT_NAME = 'live_stream_audit';
export const LIVE_STREAM_AUDIT_DEF: TaskDef = { delay: 10 * 1000, ex: 60 };
