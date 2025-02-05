import { describe, it, expect } from 'vitest';
import { ChannelPriorityEvaluator } from './priority.evaluator.js';
import { ChannelPriorityConfig, ChannelPriorityShift } from '../../common/config.types.js';

describe('ChannelPriorityChecker', () => {
  it('test noneRank', () => {
    const conf1 = conf(undefined, undefined, undefined, 2);
    expect(checker(conf1).noneRank).eq(2);

    const conf2 = conf(undefined, undefined, undefined, 4);
    expect(() => checker(conf2)).toThrow('None rank must be 1, 2 or 3');
  });

  it('test should', () => {
    expect(checker(conf()).getRank('should')).eq(2);
    expect(checker(conf('promote')).getRank('should')).eq(1);
    expect(checker(conf('demote')).getRank('should')).eq(3);
  });

  it('test may', () => {
    expect(checker(conf()).getRank('may')).eq(2);
    expect(() => checker(conf(undefined, 'promote'))).toThrow('May cannot be promote');
    expect(checker(conf('demote', undefined)).getRank('may')).eq(3);
    expect(checker(conf(undefined, 'demote')).getRank('may')).eq(3);
  });

  it('test review', () => {
    expect(checker(conf()).getRank('review')).eq(3);
    expect(checker(conf(undefined, undefined, 'promote')).getRank('review')).eq(2);

    const conf1 = conf(undefined, 'demote', 'promote');
    expect(() => checker(conf1)).toThrow('Review cannot be promote if may is demote');

    const conf2 = conf(undefined, 'demote', 'promote');
    expect(() => checker(conf2)).toThrow('Review cannot be promote if may is demote');

    const conf3 = conf(undefined, undefined, 'demote');
    expect(() => checker(conf3)).toThrow('Review cannot be demote');
  });
});

function checker(conf: ChannelPriorityConfig): ChannelPriorityEvaluator {
  return new ChannelPriorityEvaluator(conf);
}

function conf(
  should: ChannelPriorityShift | undefined = undefined,
  may: ChannelPriorityShift | undefined = undefined,
  review: ChannelPriorityShift | undefined = undefined,
  noneRank: number = 1,
): ChannelPriorityConfig {
  return { noneRank, should, may, review };
}
