import { create } from 'zustand';

import { ChannelPageState } from '@/entities/channel/channel/model/ChannelPageState.ts';

interface GlobalState {
  pageState: ChannelPageState | null;
  setPageState: (state: ChannelPageState | null) => void;
}

export const useChannelPageStore = create<GlobalState>((set) => ({
  pageState: null,
  setPageState: (pageState) => set(() => ({ pageState })),
}));
