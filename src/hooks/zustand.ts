// lib/stores/themeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the shape of the store's state and actions
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => 
        set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-theme', 
    }
  )
);