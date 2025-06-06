import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { stacktrace } from '../../utils/errors/utils.js';

interface LiveAttr {
  live_id: string;
  platform: string;
  channel_uid: string;
  channel_name: string;
  live_title: string;
  criterion_name?: string;
  node_name?: string;
  node_assigned_count?: number;
  stack_trace?: string;
}

interface Options {
  cr?: CriterionDto;
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
    const { node, cr, err } = opts;
    if (node) {
      attr.node_name = node.name;
      if (node.lives) {
        attr.node_assigned_count = node.lives.length;
      }
    }
    if (cr) {
      attr.criterion_name = cr.name;
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
