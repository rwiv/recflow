export const CHANNEL_PRIORITIES = ['must', 'should', 'may', 'review', 'skip', 'none'] as const;
export const CHANNEL_PRIORIES_MAP = {
  must: 1,
  should: 2,
  may: 3,
  review: 4,
  skip: 5,
  none: 6,
};

export const CHANNEL_PRIORITY_RANKS = [1, 2, 3] as const;
