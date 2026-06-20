/**
 * ThemesScreen — Color palette selector
 *
 * "The color palette, described as 'soft,' must be scientifically curated
 *  to reduce eye strain while maintaining high contrast for readability."
 *
 * Choose the theme that matches your current inner weather.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { AVAILABLE_THEMES, type ThemeVariant } from '../store/themeStore';
import { BreezeCard } from '../components/common/BreezeCard';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

export function ThemesScreen() {
  const { colors, themeId, setTheme } = useTheme();

  const handleThemeSelect = useCallback(
    (id: ThemeVariant) => {
      setTheme(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [setTheme],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Themes</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
          Choose your inner weather
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionNote, { color: colors.textSecondary }]}>
          Colors drawn from nature at twilight — they whisper, not shout.
        </Text>

        <View style={styles.themesGrid}>
          {AVAILABLE_THEMES.map((theme) => {
            const isActive = theme.id === themeId;
            return (
              <TouchableOpacity
                key={theme.id}
                onPress={() => handleThemeSelect(theme.id)}
                activeOpacity={0.7}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isActive ? colors.accent : colors.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                {/* Color preview */}
                <View
                  style={[
                    styles.themePreview,
                    { backgroundColor: theme.preview },
                  ]}
                >
                  <Text style={styles.themePreviewCode}>{"const"}</Text>
                  <Text style={[styles.themePreviewCode, { color: theme.colors.syntaxFunction }]}>
                    {" breeze"}
                  </Text>
                  <Text style={[styles.themePreviewCode, { color: theme.colors.syntaxOperator }]}>
                    {" ="}
                  </Text>
                  <Text style={[styles.themePreviewCode, { color: theme.colors.syntaxString }]}>
                    {` "${theme.name}"`}
                  </Text>
                </View>

                {/* Theme info */}
                <View style={styles.themeInfo}>
                  <View style={styles.themeNameRow}>
                    <Text style={[styles.themeName, { color: colors.textPrimary }]}>
                      {theme.name}
                    </Text>
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: colors.accent }]}>
                        <Text style={[styles.activeBadgeText, { color: colors.background }]}>
                          Active
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
                    {theme.description}
                  </Text>

                  {/* Color swatches */}
                  <View style={styles.swatches}>
                    {[
                      theme.colors.syntaxKeyword,
                      theme.colors.syntaxFunction,
                      theme.colors.syntaxString,
                      theme.colors.syntaxType,
                      theme.colors.accent,
                    ].map((color, i) => (
                      <View
                        key={i}
                        style={[styles.swatch, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.note}>
          <Text style={[styles.noteText, { color: colors.textTertiary }]}>
            More themes coming soon. The palette is always growing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing['7xl'],
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  sectionNote: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.6,
  },
  themesGrid: {
    gap: Spacing.xl,
  },
  themeCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  themePreview: {
    padding: Spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 80,
    alignItems: 'center',
  },
  themePreviewCode: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#eceff1',
  },
  themeInfo: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  themeName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  activeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  activeBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  themeDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  swatches: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  note: {
    paddingVertical: Spacing['3xl'],
  },
  noteText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
