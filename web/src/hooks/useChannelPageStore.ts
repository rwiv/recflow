import { create } from 'zustand';
import { ChannelPageState } from '@/common/channel.page.ts';

interface GlobalState {
  pageState: ChannelPageState | null;
  setPageState: (state: ChannelPageState | null) => void;
}

export const useChannelPageStore = create<GlobalState>((set) => ({
  pageState: null,
  setPageState: (pageState) => set(() => ({ pageState })),
}));
