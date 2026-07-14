/**
 * Apex Bridge Color Palette
 *
 * Scientifically curated for eye comfort with biophilic design principles.
 * Colors are drawn from nature at twilight — they whisper, not shout.
 * Each hue fosters a psychological state of safety and creative confidence.
 */

export const BreezeColors = {
  // ── Core Backgrounds ──────────────────────────────────────────────────────
  /** Deep calming indigo — primary background */
  background: '#1a1f3a',
  /** Slightly lighter layer for cards and panels */
  surface: '#232845',
  /** Elevated surface for modals and overlays */
  surfaceElevated: '#2c3255',
  /** Subtle border color */
  border: '#3a4070',

  // ── Text ──────────────────────────────────────────────────────────────────
  /** Primary text — warm soft white */
  textPrimary: '#e8eaf6',
  /** Secondary text — muted lavender */
  textSecondary: '#9fa8da',
  /** Tertiary text — dim slate */
  textTertiary: '#5c6bc0',
  /** Placeholder text */
  textPlaceholder: '#3d4a7a',

  // ── Brand Accents ─────────────────────────────────────────────────────────
  /** Warm breeze teal — primary accent */
  accent: '#64b5f6',
  /** Soft sky blue — secondary accent */
  accentSoft: '#42a5f5',
  /** Gentle amber — warm highlight */
  warm: '#ffcc80',
  /** Muted sage — success / nature */
  sage: '#a5d6a7',
  /** Soft terracotta — warning / variable */
  terracotta: '#ef9a9a',
  /** Soft rose — error */
  rose: '#f48fb1',

  // ── Syntax Highlighting (earth tone spectrum) ─────────────────────────────
  /** Terracotta for variables */
  syntaxVariable: '#ef9a9a',
  /** Sage green for functions */
  syntaxFunction: '#a5d6a7',
  /** Soft amber for keywords */
  syntaxKeyword: '#ffcc80',
  /** Cool mist for strings */
  syntaxString: '#80cbc4',
  /** Lavender for types */
  syntaxType: '#ce93d8',
  /** Steel blue for numbers */
  syntaxNumber: '#81d4fa',
  /** Muted slate for comments */
  syntaxComment: '#546e7a',
  /** Soft white for default text */
  syntaxDefault: '#eceff1',
  /** Indigo for operators */
  syntaxOperator: '#b39ddb',
  /** Warm gold for decorators */
  syntaxDecorator: '#ffd54f',

  // ── Status ────────────────────────────────────────────────────────────────
  success: '#a5d6a7',
  warning: '#ffcc80',
  error: '#f48fb1',
  info: '#81d4fa',

  // ── Flow Tab States ───────────────────────────────────────────────────────
  tabActive: '#64b5f6',
  tabInactive: '#3d4a7a',
  tabActiveBackground: 'rgba(100, 181, 246, 0.15)',

  // ── Transparency Layers ───────────────────────────────────────────────────
  overlay: 'rgba(26, 31, 58, 0.85)',
  glassLight: 'rgba(100, 181, 246, 0.08)',
  glassMedium: 'rgba(100, 181, 246, 0.15)',
  glassStrong: 'rgba(100, 181, 246, 0.25)',

  // ── Onboarding Gradient Stops ─────────────────────────────────────────────
  gradientStart: '#1a1f3a',
  gradientMid: '#1e2952',
  gradientEnd: '#162032',

  // ── Breeze Glow ───────────────────────────────────────────────────────────
  glow: 'rgba(100, 181, 246, 0.4)',
  glowWarm: 'rgba(255, 204, 128, 0.3)',
} as const;

export type BreezeColor = keyof typeof BreezeColors;
export type ThemeColors = { [K in BreezeColor]: string };

/** Returns a color with applied opacity */
export function withOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
