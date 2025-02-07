export const CHANNEL_PRIORITIES = ['must', 'should', 'may', 'review', 'skip', 'none'] as const;
export const CHANNEL_PRIORIES_RANK_MAP = {
  must: 1,
  should: 2,
  may: 3,
  review: 4,
  skip: 5,
  none: 6,
};

export const CHANNEL_PRIORIES_VALUE_MAP = {
  must: 'must',
  should: 'should',
  may: 'may',
  review: 'review',
  skip: 'skip',
  none: 'none',
};

export const CHANNEL_PRIORITY_RANKS = [1, 2, 3] as const;
