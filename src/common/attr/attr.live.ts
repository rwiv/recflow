import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { GradeDto } from '../../channel/spec/grade.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { LiveDto, LiveStreamDto } from '../../live/spec/live.dto.schema.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { stacktrace } from '../../utils/errors/utils.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';

interface LiveAttr {
  platform: string;
  live_id: string;
  live_uid: string;
  live_title: string;
  video_name: string;
  channel_uid: string;
  channel_name: string;
  grade_name: string;
  criterion_name?: string;
  node_name?: string;
  node_assigned_count?: number;
  source_id?: string;
  stream_url?: string;
  stack_trace?: string;
}

interface LiveInfoAttr {
  platform: string;
  live_uid: string;
  live_title: string;
  channel_uid: string;
  channel_name: string;
  grade_name?: string;
  criterion_name?: string;
  stack_trace?: string;
}

interface NodeAttr {
  id: string;
  group_id: string;
  name: string;
  lives_cnt: number;
}

interface Options {
  cr?: CriterionDto;
  node?: NodeDtoWithLives | null;
  gr?: GradeDto;
  st?: boolean;
  err?: unknown;
}

export function nodeAttr(node: NodeDto): NodeAttr {
  return {
    id: node.id,
    group_id: node.groupId,
    name: node.name,
    lives_cnt: node.livesCnt,
  };
}

export function liveAttr(live: LiveDto, opts?: Options): LiveAttr {
  const attr: LiveAttr = {
    platform: live.platform.name,
    live_id: live.id,
    live_uid: live.sourceId,
    live_title: live.liveTitle,
    video_name: live.videoName,
    channel_uid: live.channel.sourceId,
    channel_name: live.channel.username,
    grade_name: live.channel.grade.name,
  };
  if (opts) {
    const { node, cr, st, err } = opts;
    if (node) {
      attr.node_name = node.name;
      if (node.lives) {
        attr.node_assigned_count = node.lives.length;
      }
    }
    if (cr) {
      attr.criterion_name = cr.name;
    }
    if (st && live.stream) {
      attr.source_id = live.stream.sourceId;
      attr.stream_url = live.stream.url;
    }
    if (err) {
      attr.stack_trace = stacktrace(err);
    }
  }
  return attr;
}

export function liveInfoAttr(liveInfo: LiveInfo, opts?: Options): LiveInfoAttr {
  const attr: LiveInfoAttr = {
    platform: liveInfo.type,
    live_uid: liveInfo.liveUid,
    live_title: liveInfo.liveTitle,
    channel_uid: liveInfo.channelUid,
    channel_name: liveInfo.channelName,
  };
  if (opts) {
    const { cr, gr, err } = opts;
    if (gr) {
      attr.grade_name = gr.name;
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

export function channelAttr(channel: ChannelDto) {
  return {
    platform: channel.platform.name,
    channel_id: channel.id,
    channel_uid: channel.sourceId,
    channel_name: channel.username,
    grade_name: channel.grade.name,
  };
}

export function streamAttr(stream: LiveStreamDto) {
  return {
    ...channelAttr(stream.channel),
    source_id: stream.sourceId,
    stream_url: stream.url,
  };
}
