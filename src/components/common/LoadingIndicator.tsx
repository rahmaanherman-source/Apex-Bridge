/**
 * LoadingIndicator — Breeze-themed loading state
 *
 * A soft pulsing light — "a single point of light in a vast darkness."
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { Duration } from '../../theme/animations';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingIndicator({ message, size = 'md' }: LoadingIndicatorProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: Duration.breathe / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: Duration.breathe / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: Duration.breathe / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: Duration.breathe / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const dotSize = { sm: 8, md: 14, lg: 20 }[size];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors.accent,
          },
          animatedStyle,
        ]}
      />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  dot: {},
  message: {
    fontSize: Typography.fontSize.sm,
    letterSpacing: Typography.letterSpacing.wide,
  },
});
