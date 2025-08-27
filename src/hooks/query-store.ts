import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';

interface QueryStore {
  queryClient: QueryClient | null;
  setQueryClient: (client: QueryClient) => void;
  isInitialized: boolean;
  setIsInitialized: (initialized: boolean) => void;
}

export const useQueryStore = create<QueryStore>((set) => ({
  queryClient: null,
  setQueryClient: (client) => set({ queryClient: client }),
  isInitialized: false,
  setIsInitialized: (initialized) => set({ isInitialized: initialized }),
}));
