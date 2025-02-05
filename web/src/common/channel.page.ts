import { ChannelPriority, ChannelSortType } from '@/common/enum.types.ts';
import { checkType } from '@/lib/union.ts';
import { CHANNEL_PRIORITIES, CHANNEL_SORT_TYPES } from '@/common/enum.consts.ts';
import { DEFAULT_PAGE_SIZE } from '@/common/consts.ts';

export interface ChannelPageState {
  curPageNum: number;
  pageSize: number;

  sorted: ChannelSortType;
  priority: ChannelPriority | undefined;
  tagName: string | undefined;
}

export function createChannelPageState(
  curPageNum: number,
  priority: string | null = null,
  tagName: string | null = null,
  sorted: string | null = null,
  pageSize: number = DEFAULT_PAGE_SIZE,
): ChannelPageState {
  if (!sorted) {
    sorted = 'latest';
  }
  return {
    curPageNum,
    priority: checkType(priority, CHANNEL_PRIORITIES),
    tagName: tagName ?? undefined,
    sorted: checkType(sorted, CHANNEL_SORT_TYPES),
    pageSize,
  };
}

export function changedPageState(
  pageState: ChannelPageState,
  newPageNum: number,
): ChannelPageState {
  return {
    ...pageState,
    curPageNum: newPageNum,
  };
}

export function toQueryString(pageState: ChannelPageState): string {
  const params = new URLSearchParams();
  params.set('p', pageState.curPageNum.toString());
  params.set('s', pageState.pageSize.toString());
  if (pageState.priority) {
    params.set('pri', pageState.priority);
  }
  if (pageState.tagName) {
    params.set('tn', pageState.tagName);
  }
  if (pageState.sorted) {
    params.set('st', pageState.sorted);
  }
  return params.toString();
}
