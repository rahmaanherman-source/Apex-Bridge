/**
 * BreezeButton — Primary interactive element
 *
 * A thumb-friendly, spring-animated button that feels alive.
 * The UI should not fight the thumb; it should dance with it.
 */

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { SpringSnappy } from '../../theme/animations';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface BreezeButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function BreezeButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: BreezeButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, SpringSnappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SpringSnappy);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, isLoading, onPress]);

  const sizeStyles = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, minHeight: 36 },
    md: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, minHeight: Spacing.tapTarget },
    lg: { paddingVertical: Spacing.xl, paddingHorizontal: Spacing['3xl'], minHeight: 52 },
  };

  const textSizes = {
    sm: Typography.fontSize.sm,
    md: Typography.fontSize.base,
    lg: Typography.fontSize.md,
  };

  const variantStyles = {
    primary: {
      container: { backgroundColor: colors.accent },
      text: { color: colors.background },
    },
    secondary: {
      container: { backgroundColor: colors.glassLight, borderWidth: 1, borderColor: colors.accent },
      text: { color: colors.accent },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.accent },
    },
    danger: {
      container: { backgroundColor: colors.rose },
      text: { color: colors.background },
    },
  };

  const isDisabled = disabled || isLoading;

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant].container,
        isDisabled && styles.disabled,
        style,
      ]}
      // @ts-expect-error animated style
      animatedStyle={animatedStyle}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variantStyles[variant].text.color} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              { fontSize: textSizes[size], color: variantStyles[variant].text.color },
              icon ? styles.labelWithIcon : null,
              textStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  label: {
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  },
  labelWithIcon: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
