/**
 * Apex Breeze Typography
 *
 * Clean, readable type scale that respects the developer's eyes.
 * Monospace for code, proportional for UI — each has its place.
 */

export const Typography = {
  // ── Font Families ─────────────────────────────────────────────────────────
  fontFamily: {
    /** Code editor font — legible at any size */
    mono: 'SpaceMono',
    /** UI font — warm and approachable */
    sans: 'System',
    /** System default */
    system: undefined,
  },

  // ── Font Sizes ────────────────────────────────────────────────────────────
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // ── Font Weights ──────────────────────────────────────────────────────────
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // ── Line Heights ──────────────────────────────────────────────────────────
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    code: 1.6,
  },

  // ── Letter Spacing ────────────────────────────────────────────────────────
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;
