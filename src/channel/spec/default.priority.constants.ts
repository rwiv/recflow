export const CHANNEL_PRIORITIES = ['must', 'should', 'may', 'review', 'skip', 'none'] as const;
// TODO: update or remove
export const CHANNEL_PRIORIES_TIER_MAP = {
  must: 1,
  should: 1,
  may: 2,
  review: 3,
  skip: 3,
  none: 1,
};

export const CHANNEL_PRIORIES_VALUE_MAP = {
  must: 'must',
  should: 'should',
  may: 'may',
  review: 'review',
  skip: 'skip',
  none: 'none',
};
