/**
 * useTheme — Reactive theme hook
 *
 * Access the active theme colors, typography, and spacing from any component.
 * The interface reflects your inner weather.
 */

import { useThemeStore } from '../store/themeStore';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

export function useTheme() {
  const { activeTheme, activeThemeId, setTheme } = useThemeStore();

  return {
    colors: activeTheme.colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    themeId: activeThemeId,
    setTheme,
    themeName: activeTheme.name,
  };
}
