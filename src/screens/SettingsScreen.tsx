/**
 * SettingsScreen — App configuration
 *
 * Font size, word wrap, line numbers, autosave, and more.
 * Placeholder for future expansion: keybindings, language servers, plugins.
 */

import React from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useEditorStore } from '../store/editorStore';
import { BreezeCard } from '../components/common/BreezeCard';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

export function SettingsScreen() {
  const { colors } = useTheme();
  const {
    fontSize,
    wordWrap,
    showLineNumbers,
    autosaveEnabled,
    setFontSize,
    setWordWrap,
    setShowLineNumbers,
    setAutosave,
  } = useEditorStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
          Tune your environment
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Editor Settings */}
        <SectionHeader title="Editor" colors={colors} />
        <BreezeCard>
          <SettingRow
            label="Font Size"
            description={`${fontSize}px`}
            colors={colors}
            rightContent={
              <View style={styles.fontSizeControl}>
                <TouchableOpacity
                  onPress={() => setFontSize(fontSize - 1)}
                  style={[styles.fontSizeButton, { backgroundColor: colors.glassLight }]}
                >
                  <Text style={[styles.fontSizeButtonText, { color: colors.textPrimary }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.fontSizeValue, { color: colors.textPrimary }]}>{fontSize}</Text>
                <TouchableOpacity
                  onPress={() => setFontSize(fontSize + 1)}
                  style={[styles.fontSizeButton, { backgroundColor: colors.glassLight }]}
                >
                  <Text style={[styles.fontSizeButtonText, { color: colors.textPrimary }]}>+</Text>
                </TouchableOpacity>
              </View>
            }
          />
          <SettingDivider colors={colors} />
          <SettingRow
            label="Word Wrap"
            description="Wrap long lines"
            colors={colors}
            rightContent={
              <Switch
                value={wordWrap}
                onValueChange={setWordWrap}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            }
          />
          <SettingDivider colors={colors} />
          <SettingRow
            label="Line Numbers"
            description="Show line number gutter"
            colors={colors}
            rightContent={
              <Switch
                value={showLineNumbers}
                onValueChange={setShowLineNumbers}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            }
          />
          <SettingDivider colors={colors} />
          <SettingRow
            label="Autosave"
            description="Save after each pause in typing"
            colors={colors}
            rightContent={
              <Switch
                value={autosaveEnabled}
                onValueChange={setAutosave}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            }
          />
        </BreezeCard>

        {/* App Settings */}
        <SectionHeader title="Application" colors={colors} />
        <BreezeCard>
          <SettingRow
            label="Theme"
            description="Customize color palette"
            colors={colors}
            rightContent={
              <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
            }
          />
          <SettingDivider colors={colors} />
          <SettingRow
            label="About Apex Bridge"
            description="Version 1.0.0"
            colors={colors}
            rightContent={
              <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
            }
          />
        </BreezeCard>

        {/* Philosophy */}
        <View style={styles.philosophy}>
          <Text style={[styles.philosophyQuote, { color: colors.textTertiary }]}>
            {'"The tools we use should reflect the best of who we want to be:\nfocused, calm, confident, and hopeful."'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{title}</Text>
  );
}

function SettingRow({
  label,
  description,
  colors,
  rightContent,
}: {
  label: string;
  description?: string;
  colors: any;
  rightContent?: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {rightContent}
    </View>
  );
}

function SettingDivider({ colors }: { colors: any }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
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
    letterSpacing: Typography.letterSpacing.wide,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing['7xl'],
    gap: Spacing.md,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.widest,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: -Spacing.cardPadding,
  },
  fontSizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
  fontSizeValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    minWidth: 28,
    textAlign: 'center',
  },
  chevron: {
    fontSize: 20,
  },
  philosophy: {
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
  },
  philosophyQuote: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 2,
  },
});
