import { create } from 'zustand';
import { ChannelPriority, ChannelSortType } from '@/common/types.ts';

interface ChannelPageState {
  curPageNum: number;
  pageSize: number;

  sorted: ChannelSortType;
  priority: ChannelPriority | undefined;
  tagName: string | undefined;
}

interface GlobalState {
  curPageState: ChannelPageState | null;
  setCurPageState: (state: ChannelPageState | null) => void;
}

export const useCurChatRoomStore = create<GlobalState>((set) => ({
  curPageState: null,
  setCurPageState: (pageState) => set(() => ({ curPageState: pageState })),
}));

export function createPageState(
  curPageNum: number,
  priority: ChannelPriority | undefined = undefined,
  tagName: string | undefined = undefined,
  sorted: ChannelSortType = 'latest',
  pageSize: number = 10,
): ChannelPageState {
  return {
    curPageNum,
    priority,
    tagName,
    sorted,
    pageSize,
  };
}
