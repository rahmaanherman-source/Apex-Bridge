/**
 * OnboardingSlide — A single guided first-use screen
 *
 * Narrative-driven onboarding that teaches WHY, not just HOW.
 * Each successful action is met with a subtle, satisfying feedback loop.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BreezeColors } from '../../theme/colors';
import { SpringGentle, Duration } from '../../theme/animations';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export interface OnboardingSlideData {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor?: string;
}

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: 'welcome',
    emoji: '🌬️',
    title: 'Welcome to Apex Breeze',
    subtitle: 'Your sanctuary for mobile development',
    description:
      'A workspace where the act of creation becomes a form of meditation. Calm, warm, and intuitive — designed for how you actually think.',
    accentColor: BreezeColors.accent,
  },
  {
    id: 'editor',
    emoji: '✍️',
    title: 'Write with Clarity',
    subtitle: 'A mobile editor that respects your flow',
    description:
      'Syntax highlighting with earth-tone colors. Autosave captures every keystroke. Tabs let you context-switch without losing your place.',
    accentColor: BreezeColors.syntaxFunction,
  },
  {
    id: 'github',
    emoji: '🔗',
    title: 'Connect to GitHub',
    subtitle: 'Your code, your repos — always in sync',
    description:
      "Pull, push, and merge without leaving the app. The bridge between your phone and the global repository feels like a handoff, not a login wall.",
    accentColor: BreezeColors.warm,
  },
  {
    id: 'vault',
    emoji: '🔐',
    title: 'Fortress of Trust',
    subtitle: 'AES-256 token protection',
    description:
      'Your credentials never leave the device in plaintext. Even during sync, everything is encrypted end-to-end. You own your secrets.',
    accentColor: BreezeColors.rose,
  },
  {
    id: 'offline',
    emoji: '✈️',
    title: 'Build Anywhere',
    subtitle: 'Offline mode is liberation, not compromise',
    description:
      "In a flight, a remote cabin, anywhere the signal fails — your work continues. Every idea is captured, every file is protected.",
    accentColor: BreezeColors.sage,
  },
];

interface OnboardingSlideProps {
  slide: OnboardingSlideData;
  isActive: boolean;
}

export function OnboardingSlide({ slide, isActive }: OnboardingSlideProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const emojiScale = useSharedValue(0.5);

  useEffect(() => {
    if (isActive) {
      opacity.value = withDelay(100, withTiming(1, { duration: Duration.slow }));
      translateY.value = withDelay(100, withSpring(0, SpringGentle));
      emojiScale.value = withDelay(50, withSpring(1, SpringGentle));
    } else {
      opacity.value = withTiming(0, { duration: Duration.fast });
      translateY.value = withTiming(12, { duration: Duration.fast });
      emojiScale.value = withTiming(0.8, { duration: Duration.fast });
    }
  }, [isActive, opacity, translateY, emojiScale]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const accentColor = slide.accentColor ?? BreezeColors.accent;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.emoji, emojiStyle]}>{slide.emoji}</Animated.Text>

      <Text style={[styles.title, { color: BreezeColors.textPrimary }]}>{slide.title}</Text>

      <Text style={[styles.subtitle, { color: accentColor }]}>{slide.subtitle}</Text>

      <Text style={[styles.description, { color: BreezeColors.textSecondary }]}>
        {slide.description}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    paddingHorizontal: Spacing['4xl'],
    alignItems: 'center',
    gap: Spacing['2xl'],
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    letterSpacing: Typography.letterSpacing.wide,
  },
  description: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.75,
    letterSpacing: Typography.letterSpacing.normal,
  },
});
