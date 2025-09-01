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
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        
        // Update DOM classes
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          document.documentElement.classList.toggle('light', newTheme === 'light');
        }
      },
      setTheme: (theme) => {
        set({ theme });
        
        // Update DOM classes
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
          document.documentElement.classList.toggle('light', theme === 'light');
        }
      },
    }),
    {
      name: 'app-theme',
      onRehydrateStorage: () => (state) => {
        // Sync DOM classes when rehydrating from storage
        if (state && typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
          document.documentElement.classList.toggle('light', state.theme === 'light');
        }
      },
    }
  )
);