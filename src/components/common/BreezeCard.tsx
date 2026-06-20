/**
 * BreezeCard — Glassmorphic surface component
 *
 * A soft, elevated surface for grouping related content.
 * Carries the visual weight of frosted glass — present but not imposing.
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { SpringGentle } from '../../theme/animations';
import { Spacing, BorderRadius } from '../../theme/spacing';

interface BreezeCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Whether to animate in on mount */
  animated?: boolean;
  /** Elevation level 1–3 */
  elevation?: 1 | 2 | 3;
  onPress?: () => void;
}

export function BreezeCard({
  children,
  style,
  animated = false,
  elevation = 1,
  onPress,
}: BreezeCardProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(animated ? 0 : 1);
  const translateY = useSharedValue(animated ? 12 : 0);

  React.useEffect(() => {
    if (animated) {
      opacity.value = withSpring(1, SpringGentle);
      translateY.value = withSpring(0, SpringGentle);
    }
  }, [animated, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const backgroundColors = {
    1: colors.surface,
    2: colors.surfaceElevated,
    3: colors.glassMedium,
  };

  const content = (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: backgroundColors[elevation], borderColor: colors.border },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.card,
            { backgroundColor: backgroundColors[elevation], borderColor: colors.border },
            style,
          ]}
          // Would use Pressable in a full implementation
        >
          {children}
        </View>
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.cardPadding,
    borderWidth: 1,
  },
});
