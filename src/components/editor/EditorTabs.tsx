/**
 * EditorTabs — Open file tab strip
 *
 * Shows open files as scrollable tabs.
 * Dirty files show a dot indicator — your unsaved thoughts, held gently.
 */

import React, { useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { useEditorStore } from '../../store/editorStore';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { getFileIcon } from '../../utils/fileUtils';

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();
  const { colors } = useTheme();

  const handleTabPress = useCallback(
    (tabId: string) => setActiveTab(tabId),
    [setActiveTab],
  );

  const handleTabClose = useCallback(
    (tabId: string) => closeTab(tabId),
    [closeTab],
  );

  if (tabs.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      contentContainerStyle={styles.content}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const icon = getFileIcon(tab.filename);

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
            style={[
              styles.tab,
              {
                borderBottomColor: isActive ? colors.accent : 'transparent',
                backgroundColor: isActive ? colors.tabActiveBackground : 'transparent',
              },
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? colors.textPrimary : colors.textTertiary,
                  fontWeight: isActive ? Typography.fontWeight.medium : Typography.fontWeight.normal,
                },
              ]}
              numberOfLines={1}
            >
              {tab.filename}
            </Text>

            {/* Dirty indicator dot */}
            {tab.isDirty && (
              <View style={[styles.dirtyDot, { backgroundColor: colors.warm }]} />
            )}

            {/* Close button */}
            <TouchableOpacity
              onPress={() => handleTabClose(tab.id)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              style={styles.closeButton}
            >
              <Text style={[styles.closeIcon, { color: colors.textTertiary }]}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 44,
    borderBottomWidth: 1,
  },
  content: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 2,
    minWidth: 80,
    maxWidth: 160,
  },
  tabIcon: {
    fontSize: 12,
  },
  tabLabel: {
    fontSize: Typography.fontSize.sm,
    flexShrink: 1,
  },
  dirtyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  closeButton: {
    padding: 2,
  },
  closeIcon: {
    fontSize: 10,
  },
});
