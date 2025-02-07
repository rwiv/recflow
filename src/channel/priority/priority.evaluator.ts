import { ChannelPriority, ChannelPriorityRank } from './types.js';
import { ChannelPriorityShift } from '../../common/config.types.js';
import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../../common/config.module.js';
import { QueryConfig } from '../../common/query.js';
import { checkEnum } from '../../utils/union.js';
import { CHANNEL_PRIORITY_RANKS } from './consts.js';

@Injectable()
export class ChannelPriorityEvaluator {
  private readonly noneRank: ChannelPriorityRank;
  private readonly should: ChannelPriorityShift | undefined;
  private readonly may: ChannelPriorityShift | undefined;
  private readonly review: ChannelPriorityShift | undefined;

  constructor(@Inject(QUERY) private readonly query: QueryConfig) {
    this.should = this.query.priority.should;
    this.may = this.query.priority.may;
    this.review = this.query.priority.review;

    if (this.should === 'demote') {
      this.may = 'demote';
    }
    const noneRank = checkEnum(this.query.priority.noneRank, CHANNEL_PRIORITY_RANKS);
    if (!noneRank) {
      throw new Error('None rank must be 1, 2 or 3');
    }
    this.noneRank = noneRank;
    this.validateShift();
  }

  getRank(priority: string): ChannelPriorityRank {
    switch (priority) {
      case 'must':
        return 1;
      case 'should':
        if (this.should === 'promote') {
          return 1;
        } else if (this.should === 'demote') {
          return 3;
        } else {
          return 2;
        }
      case 'may':
        if (this.may === 'demote') {
          return 3;
        } else {
          return 2;
        }
      case 'review':
        if (this.review === 'promote') {
          return 2;
        } else {
          return 3;
        }
      case 'skip':
        return 3;
      case 'none':
        return this.noneRank;
      default:
        throw new Error('Invalid priority');
    }
  }

  private validateShift() {
    if (![1, 2, 3].includes(this.noneRank)) {
      throw new Error('None rank must be 1, 2 or 3');
    }
    if (this.may === 'promote') {
      throw new Error('May cannot be promote');
    }
    if (this.may === 'demote' && this.review === 'demote') {
      throw new Error('May cannot be demote if review is demote');
    }
    if (this.review === 'promote' && this.may === 'demote') {
      throw new Error('Review cannot be promote if may is demote');
    }
    if (this.review === 'demote') {
      throw new Error('Review cannot be demote');
    }
  }
}
