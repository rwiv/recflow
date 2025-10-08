import { Injectable } from '@nestjs/common';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { NodeSelectorArgs } from '../../node/service/node.selector.js';
import { LiveDtoMapped } from '../spec/live.dto.schema.mapped.js';
import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';

export interface NodeSelectArgs {
  ignoreNodeIds?: string[];
  ignoreGroupIds?: string[];
  domesticOnly?: boolean;
  overseasFirst?: boolean;
}

@Injectable()
export class LiveRegisterHelper {
  getNodeSelectArgs(
    req: NodeSelectArgs,
    channel: ChannelDto,
    live: LiveDtoMapped | undefined,
    criterion: CriterionDto | undefined,
  ): NodeSelectorArgs {
    let domesticOnly = false;
    if (criterion) {
      domesticOnly = criterion.domesticOnly;
    }
    if (live) {
      domesticOnly = live.domesticOnly;
    }
    if (req.domesticOnly !== undefined) {
      domesticOnly = req.domesticOnly;
    }

    let overseasFirst = channel.overseasFirst;
    if (criterion) {
      overseasFirst = criterion.overseasFirst;
    }
    if (live) {
      overseasFirst = live.overseasFirst;
    }
    if (req.overseasFirst !== undefined) {
      overseasFirst = req.overseasFirst;
    }

    const opts: NodeSelectorArgs = { ignoreNodeIds: [], ignoreGroupIds: [], domesticOnly, overseasFirst };
    if (req.ignoreGroupIds) {
      opts.ignoreGroupIds = [...req.ignoreGroupIds];
    }
    if (req.ignoreNodeIds) {
      opts.ignoreNodeIds = [...req.ignoreNodeIds];
    }
    if (live && live.nodes) {
      opts.ignoreNodeIds = [...opts.ignoreNodeIds, ...live.nodes.map((node) => node.id)];
    }

    return opts;
  }
}
