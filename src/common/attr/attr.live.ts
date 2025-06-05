import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { stacktrace } from '../../utils/errors/utils.js';

interface LiveAttr {
  live_id: string;
  platform: string;
  channel_uid: string;
  channel_name: string;
  live_title: string;
  node?: string;
  assigned?: number;
  stack_trace?: string;
}

interface Options {
  node?: NodeDtoWithLives | null;
  err?: unknown;
}

export function liveAttr(live: LiveDto, opts?: Options) {
  const attr: LiveAttr = {
    live_id: live.id,
    platform: live.platform.name,
    channel_uid: live.channel.pid,
    channel_name: live.channel.username,
    live_title: live.liveTitle,
  };
  if (opts) {
    const { node, err } = opts;
    if (node) {
      attr.node = node.name;
      if (node.lives) {
        attr.assigned = node.lives.length;
      }
    }
    if (err) {
      attr.stack_trace = stacktrace(err);
    }
  }
  return attr;
}

export function liveInfoAttr(liveInfo: LiveInfo) {
  return {
    platform: liveInfo.type,
    channelId: liveInfo.pid,
    channelName: liveInfo.channelName,
    liveTitle: liveInfo.liveTitle,
  };
}
