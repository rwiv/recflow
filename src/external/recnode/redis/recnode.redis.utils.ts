import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { RecnodeLocationType } from '@/external/recnode/common/recnode.types.js';
import { LiveState } from '@/external/recnode/redis/recnode.redis.data.js';

import { LiveDto } from '@/live/spec/live.dto.schema.js';

export function liveDtoToState(live: LiveDto, location: RecnodeLocationType): LiveState {
  if (!live.stream) {
    throw NotFoundError.from('live.stream', 'id', live.id);
  }
  const now = new Date();
  return {
    id: live.id,
    platform: live.platform.name,
    channelId: live.channel.sourceId,
    channelName: live.channel.username,
    liveId: live.sourceId,
    liveTitle: live.liveTitle,
    platformCookie: null,
    streamUrl: live.stream.url,
    streamParams: live.stream.params,
    streamHeaders: live.stream.headers,
    videoName: live.videoName,
    fsName: live.fsName,
    location,
    isInvalid: false,
    createdAt: now,
    updatedAt: now,
  };
}
