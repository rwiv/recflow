import { create } from 'zustand';
import { ChannelPageState } from '@/hooks/channel.page.state.ts';

interface GlobalState {
  pageState: ChannelPageState | null;
  setPageState: (state: ChannelPageState | null) => void;
}

export const useChannelPageStore = create<GlobalState>((set) => ({
  pageState: null,
  setPageState: (pageState) => set(() => ({ pageState })),
}));
