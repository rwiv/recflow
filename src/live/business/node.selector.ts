import { Inject, Injectable } from '@nestjs/common';
import { NODE_SELECTOR_CHZZK, NODE_SELECTOR_SOOP } from '../node/node.module.js';
import { LiveInfo } from '../../platform/wapper/live.js';
import { NodeSelector, NodeRecord } from '../node/types.js';

@Injectable()
export class PlatformNodeSelector {
  constructor(
    @Inject(NODE_SELECTOR_CHZZK) private readonly chzzkMatcher: NodeSelector,
    @Inject(NODE_SELECTOR_SOOP) private readonly soopMatcher: NodeSelector,
  ) {}

  matchNode(live: LiveInfo, nodes: NodeRecord[]): NodeRecord | null {
    const matcher = this.selectMatcher(live);
    return matcher.match(live, nodes);
  }

  private selectMatcher(live: LiveInfo) {
    if (live.type === 'chzzk') {
      return this.chzzkMatcher;
    } else if (live.type === 'soop') {
      return this.soopMatcher;
    } else {
      console.error(typeof live);
      console.error(live);
      throw new Error('Invalid live type');
    }
  }
}
