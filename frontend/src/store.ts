import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Preferences = {
  theme: 'light' | 'dark'; textScale: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; lang: 'en' | 'hi'; mode: 'discover' | 'research';
  setTheme: (theme: 'light' | 'dark') => void;
  setTextScale: (textScale: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => void;
  setLang: (lang: 'en' | 'hi') => void;
  setMode: (mode: 'discover' | 'research') => void;
};


export const usePreferences = create<Preferences>()(persist((set) => ({
  theme: 'light', textScale: 'md', lang: 'en', mode: 'discover',
  setTheme: (theme) => set({ theme }), setTextScale: (textScale) => set({ textScale }),
  setLang: (lang) => set({ lang }), setMode: (mode) => set({ mode }),
}), { name: 'prism-preferences', partialize: ({ theme, textScale, lang, mode }) => ({ theme, textScale, lang, mode }) as Preferences }));
