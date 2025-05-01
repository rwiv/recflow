import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { LiveState } from './stdl.redis.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

export function liveDtoToState(dto: LiveDto): LiveState {
  if (!dto.streamUrl) {
    throw new ValidationError(`streamUrl is required for liveDto`);
  }
  return {
    id: dto.id,
    platform: dto.platform.name,
    channelId: dto.channel.pid,
    channelName: dto.channel.username,
    liveId: dto.sourceId,
    liveTitle: dto.liveTitle,
    streamUrl: dto.streamUrl,
    headers: dto.headers,
    fsName: dto.fsName,
    videoName: dto.videoName,
  };
}
