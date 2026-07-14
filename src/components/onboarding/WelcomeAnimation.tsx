/**
 * WelcomeAnimation — The opening ceremony
 *
 * "Perhaps it begins with a single point of light in a vast darkness,
 *  representing an idea. As the user taps, the light grows, branches out,
 *  forming trees, then buildings, then complex structures."
 *
 * This animation sets the emotional tone from the very first moment.
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BreezeColors } from '../../theme/colors';
import { Duration, SpringGentle, EaseBreeze } from '../../theme/animations';
import { Typography } from '../../theme/typography';

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  // Core light point
  const dotScale = useSharedValue(0);
  const dotOpacity = useSharedValue(0);

  // Ring expansions (simulate the idea branching outward)
  const ring1Scale = useSharedValue(0);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(0);
  const ring3Opacity = useSharedValue(0);

  // Logo and text
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  // Overall screen fade
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Dot appears
    dotOpacity.value = withDelay(200, withTiming(1, { duration: Duration.fast }));
    dotScale.value = withDelay(200, withSpring(1, SpringGentle));

    // 2. Rings expand outward — the idea branching
    ring1Opacity.value = withDelay(500, withTiming(0.7, { duration: Duration.slow }));
    ring1Scale.value = withDelay(500, withTiming(2.5, { duration: Duration.ceremonial, easing: EaseBreeze }));

    ring2Opacity.value = withDelay(700, withTiming(0.5, { duration: Duration.slow }));
    ring2Scale.value = withDelay(700, withTiming(3.5, { duration: Duration.ceremonial, easing: EaseBreeze }));

    ring3Opacity.value = withDelay(900, withTiming(0.3, { duration: Duration.slow }));
    ring3Scale.value = withDelay(900, withTiming(5, { duration: Duration.ceremonial, easing: EaseBreeze }));

    // 3. Dot fades, logo appears
    dotOpacity.value = withDelay(1200, withTiming(0, { duration: Duration.normal }));

    logoOpacity.value = withDelay(1400, withTiming(1, { duration: Duration.slow }));
    logoScale.value = withDelay(1400, withSpring(1, SpringGentle));

    // 4. Tagline drifts in
    taglineOpacity.value = withDelay(1800, withTiming(1, { duration: Duration.slow }));
    taglineTranslateY.value = withDelay(1800, withSpring(0, SpringGentle));

    // 5. Screen fades out and calls onComplete
    screenOpacity.value = withDelay(
      3800,
      withTiming(0, { duration: Duration.ceremonial, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));

  const ring3Style = useAnimatedStyle(() => ({
    opacity: ring3Opacity.value,
    transform: [{ scale: ring3Scale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <LinearGradient
        colors={[BreezeColors.gradientStart, BreezeColors.gradientMid, BreezeColors.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* Expanding rings */}
      <Animated.View style={[styles.ring, ring3Style]} />
      <Animated.View style={[styles.ring, styles.ring2, ring2Style]} />
      <Animated.View style={[styles.ring, styles.ring1, ring1Style]} />

      {/* The origin point of light */}
      <Animated.View style={[styles.dot, dotStyle]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Text style={styles.logoText}>🌬️</Text>
        <Text style={styles.appName}>Apex Bridge</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <Text style={styles.tagline}>
          {"Drift in, breathe easy,\nand let your ideas move freely forward."}
        </Text>
        <Text style={styles.subTagline}>where hope moves with you</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BreezeColors.background,
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: BreezeColors.accent,
  },
  ring1: {
    borderColor: BreezeColors.accentSoft,
  },
  ring2: {
    borderColor: BreezeColors.glassMedium,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BreezeColors.accent,
    shadowColor: BreezeColors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 0,
  },
  logoText: {
    fontSize: 56,
  },
  appName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: BreezeColors.textPrimary,
    letterSpacing: Typography.letterSpacing.wider,
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  tagline: {
    fontSize: Typography.fontSize.md,
    color: BreezeColors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * 1.6,
    letterSpacing: Typography.letterSpacing.normal,
  },
  subTagline: {
    fontSize: Typography.fontSize.sm,
    color: BreezeColors.accent,
    letterSpacing: Typography.letterSpacing.widest,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
