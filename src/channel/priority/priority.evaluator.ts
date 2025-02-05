import { ChannelPriority } from './types.js';
import { ChannelPriorityConfig, ChannelPriorityShift } from '../../common/config.types.js';

export class ChannelPriorityEvaluator {
  readonly noneRank: number;
  readonly should: ChannelPriorityShift | undefined;
  readonly may: ChannelPriorityShift | undefined;
  readonly review: ChannelPriorityShift | undefined;

  constructor(private readonly conf: ChannelPriorityConfig) {
    this.noneRank = this.conf.noneRank;
    this.should = this.conf.should;
    this.may = this.conf.may;
    this.review = this.conf.review;

    if (this.should === 'demote') {
      this.may = 'demote';
    }
    this.validateShift();
  }

  getRank(priority: ChannelPriority): number {
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
    }
  }

  validateShift() {
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
