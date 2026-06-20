/**
 * Apex Breeze Spacing System
 *
 * Consistent spatial rhythm based on a 4pt grid.
 * Thumb-friendly touch targets, breathable layouts.
 */

export const Spacing = {
  /** 2px */
  xs: 2,
  /** 4px */
  sm: 4,
  /** 8px */
  md: 8,
  /** 12px */
  lg: 12,
  /** 16px */
  xl: 16,
  /** 20px */
  '2xl': 20,
  /** 24px */
  '3xl': 24,
  /** 32px */
  '4xl': 32,
  /** 40px */
  '5xl': 40,
  /** 48px */
  '6xl': 48,
  /** 64px */
  '7xl': 64,

  // ── Semantic Spacing ──────────────────────────────────────────────────────
  /** Minimum tap target — 44pt Apple HIG */
  tapTarget: 44,
  /** Screen horizontal padding */
  screenPadding: 16,
  /** Card internal padding */
  cardPadding: 16,
  /** Tab bar height */
  tabBarHeight: 70,
  /** Header height */
  headerHeight: 56,
  /** Bottom safe area base */
  bottomSafe: 34,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;
