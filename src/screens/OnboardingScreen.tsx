/**
 * OnboardingScreen — Narrative-driven first-use experience
 *
 * Teaches WHY, not just HOW. Walks the user through their first file,
 * first repo connection, first commit — while reinforcing calm confidence.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { OnboardingSlide, ONBOARDING_SLIDES } from '../components/onboarding/OnboardingSlide';
import { BreezeButton } from '../components/common/BreezeButton';
import { BreezeColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

export function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { completeOnboarding } = useAuthStore();

  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;

  const goToNext = useCallback(() => {
    if (isLast) {
      completeOnboarding();
      return;
    }
    const next = currentIndex + 1;
    setCurrentIndex(next);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [currentIndex, isLast, completeOnboarding]);

  const goToPrev = useCallback(() => {
    if (currentIndex === 0) return;
    const prev = currentIndex - 1;
    setCurrentIndex(prev);
    scrollRef.current?.scrollTo({ x: prev * width, animated: true });
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const handleScroll = useCallback((event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[BreezeColors.gradientStart, BreezeColors.gradientMid, BreezeColors.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Skip button */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slide carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        scrollEventThrottle={16}
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slideWrapper}>
            <OnboardingSlide slide={slide} isActive={index === currentIndex} />
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              scrollRef.current?.scrollTo({ x: index * width, animated: true });
            }}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex ? BreezeColors.accent : BreezeColors.tabInactive,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentIndex > 0 && (
          <TouchableOpacity onPress={goToPrev} style={styles.backButton}>
            <Text style={[styles.backText, { color: BreezeColors.textSecondary }]}>← Back</Text>
          </TouchableOpacity>
        )}

        <BreezeButton
          label={isLast ? "Let's Begin 🌬️" : 'Continue →'}
          onPress={goToNext}
          variant="primary"
          size="lg"
          style={styles.nextButton}
        />
      </View>

      {/* Quote at bottom */}
      <Text style={styles.quote}>
        "where hope moves with you"
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BreezeColors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.md,
  },
  skipText: {
    color: BreezeColors.textSecondary,
    fontSize: Typography.fontSize.sm,
    letterSpacing: Typography.letterSpacing.wide,
  },
  carousel: {
    flex: 1,
    marginTop: 60,
  },
  carouselContent: {
    alignItems: 'center',
  },
  slideWrapper: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  dot: {
    height: 8,
    borderRadius: BorderRadius.full,
    transition: 'width 0.3s',
  } as any,
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.xl,
  },
  backButton: {
    padding: Spacing.md,
  },
  backText: {
    fontSize: Typography.fontSize.base,
  },
  nextButton: {
    flex: 1,
    maxWidth: 280,
  },
  quote: {
    textAlign: 'center',
    color: BreezeColors.textTertiary,
    fontSize: Typography.fontSize.xs,
    letterSpacing: Typography.letterSpacing.wider,
    fontStyle: 'italic',
    paddingBottom: Spacing.xl,
  },
});
