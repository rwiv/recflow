import { channelTaskName } from '../channel/channel.tasks.constants.js';
import { nodeTaskName } from '../node/node.tasks.constants.js';
import { liveTaskName } from '../live/live.task.names.js';

export const cronQueueNames = [
  channelTaskName.CHANNEL_CACHE_CHECK,
  channelTaskName.CHANNEL_REFRESH,
  nodeTaskName.NODE_RESET,
  liveTaskName.LIVE_ALLOCATION,
  liveTaskName.LIVE_CLEANUP,
  liveTaskName.LIVE_REFRESH,
  liveTaskName.LIVE_RECOVERY,
  liveTaskName.LIVE_REGISTER_FOLLOWED,
  liveTaskName.LIVE_STATE_CLEANUP,
];

export const queueNames = [...cronQueueNames];
