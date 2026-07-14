/**
 * Apex Bridge Motion System
 *
 * Fluid, physics-inspired animations that mimic air currents.
 * Transitions carry momentum — like a breeze parting clouds.
 *
 * "When a user swipes between tabs, the transition shouldn't just slide;
 *  it should ripple, carrying the momentum of the gesture."
 */

import {
  withSpring,
  withTiming,
  withDelay,
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

// ── Duration Constants ───────────────────────────────────────────────────────
export const Duration = {
  /** Instant — imperceptible but there */
  instant: 100,
  /** Quick micro-interaction */
  fast: 200,
  /** Standard UI transition */
  normal: 300,
  /** Gentle entrance */
  slow: 500,
  /** Ceremonial — onboarding, welcome */
  ceremonial: 800,
  /** Breathing cycle */
  breathe: 2000,
} as const;

// ── Spring Configurations ────────────────────────────────────────────────────

/** Snappy spring — button presses, toggles */
export const SpringSnappy: WithSpringConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

/** Gentle spring — tab transitions, cards */
export const SpringGentle: WithSpringConfig = {
  damping: 18,
  stiffness: 120,
  mass: 1.0,
};

/** Fluid spring — page transitions, flow ripples */
export const SpringFluid: WithSpringConfig = {
  damping: 22,
  stiffness: 90,
  mass: 1.2,
};

/** Breeze spring — the hallmark motion; weightless */
export const SpringBreeze: WithSpringConfig = {
  damping: 15,
  stiffness: 60,
  mass: 1.5,
};

// ── Easing Curves ────────────────────────────────────────────────────────────

export const EaseBreeze = Easing.bezier(0.25, 0.46, 0.45, 0.94);
export const EaseOut = Easing.bezier(0.0, 0.0, 0.2, 1.0);
export const EaseIn = Easing.bezier(0.4, 0.0, 1.0, 1.0);
export const EaseInOut = Easing.bezier(0.4, 0.0, 0.2, 1.0);

// ── Timing Configurations ────────────────────────────────────────────────────

export const TimingFast: WithTimingConfig = {
  duration: Duration.fast,
  easing: EaseOut,
};

export const TimingNormal: WithTimingConfig = {
  duration: Duration.normal,
  easing: EaseBreeze,
};

export const TimingSlow: WithTimingConfig = {
  duration: Duration.slow,
  easing: EaseBreeze,
};

// ── Pre-built Animation Factories ────────────────────────────────────────────

/** Fade in with a gentle breeze feel */
export function breezeIn(toValue: number = 1, delay: number = 0) {
  const anim = withSpring(toValue, SpringGentle);
  return delay > 0 ? withDelay(delay, anim) : anim;
}

/** Slide up entrance — content drifting in */
export function driftUp(delay: number = 0) {
  const anim = withSpring(0, SpringFluid);
  return delay > 0 ? withDelay(delay, anim) : anim;
}

/** Pulse animation — the "breathe" mechanism */
export function breathePulse(phase: 'in' | 'out') {
  return withTiming(phase === 'in' ? 1.04 : 1.0, {
    duration: Duration.breathe,
    easing: Easing.inOut(Easing.sin),
  });
}

/** Ripple scale for tab momentum carry */
export function rippleScale() {
  return withSpring(1, SpringBreeze);
}

/** Success haptic flourish scale */
export function successScale() {
  return withSpring(1, SpringSnappy);
}

/** Stagger delay helper for list entrances */
export function staggerDelay(index: number, baseDelay: number = 80): number {
  return index * baseDelay;
}
