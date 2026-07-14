/**
 * Theme Store — Zustand
 *
 * Manages the active color theme.
 * The interface reflects your inner weather — during focus, visual noise recedes.
 */

import { create } from 'zustand';
import { BreezeColors, type ThemeColors } from '../theme/colors';

export type ThemeVariant = 'breeze' | 'midnight' | 'dawn' | 'forest' | 'ember';

export interface ThemeDefinition {
  id: ThemeVariant;
  name: string;
  description: string;
  colors: ThemeColors;
  preview: string;
}

/** Midnight — the default deep indigo theme */
const MidnightTheme: ThemeDefinition = {
  id: 'midnight',
  name: 'Midnight',
  description: 'Deep indigo twilight. The classic Apex Bridge experience.',
  preview: '#1a1f3a',
  colors: BreezeColors,
};

/** Dawn — warm sunrise tones */
const DawnTheme: ThemeDefinition = {
  id: 'dawn',
  name: 'Dawn',
  description: 'Warm amber and rose — for early morning sessions.',
  preview: '#2d1f1a',
  colors: {
    ...BreezeColors,
    background: '#2d1f1a',
    surface: '#3a2820',
    surfaceElevated: '#4a3228',
    accent: '#ffb74d',
    accentSoft: '#ffa726',
    textSecondary: '#d7a87d',
    border: '#6a4030',
  },
};

/** Forest — sage and deep green */
const ForestTheme: ThemeDefinition = {
  id: 'forest',
  name: 'Forest Floor',
  description: 'Deep greens and earthy tones — grounded and alive.',
  preview: '#1a2d1f',
  colors: {
    ...BreezeColors,
    background: '#1a2d1f',
    surface: '#213828',
    surfaceElevated: '#2a4530',
    accent: '#81c784',
    accentSoft: '#66bb6a',
    textSecondary: '#a5d6a7',
    border: '#3a6040',
  },
};

/** Ember — warm deep red/orange for focus */
const EmberTheme: ThemeDefinition = {
  id: 'ember',
  name: 'Ember',
  description: 'Warm embers in the dark — intense focus.',
  preview: '#2d1a1a',
  colors: {
    ...BreezeColors,
    background: '#2d1a1a',
    surface: '#3a2020',
    surfaceElevated: '#4a2828',
    accent: '#ef9a9a',
    accentSoft: '#e57373',
    textSecondary: '#d7948d',
    border: '#6a3030',
  },
};

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  MidnightTheme,
  DawnTheme,
  ForestTheme,
  EmberTheme,
];

export function isThemeVariant(value: string): value is ThemeVariant {
  return AVAILABLE_THEMES.some((theme) => theme.id === value);
}

interface ThemeState {
  activeThemeId: ThemeVariant;
  activeTheme: ThemeDefinition;

  setTheme: (themeId: ThemeVariant) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  activeThemeId: 'midnight',
  activeTheme: MidnightTheme,

  setTheme: (themeId) => {
    const theme = AVAILABLE_THEMES.find((t) => t.id === themeId) ?? MidnightTheme;
    set({ activeThemeId: themeId, activeTheme: theme });
  },
}));
