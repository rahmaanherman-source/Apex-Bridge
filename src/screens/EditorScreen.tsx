/**
 * EditorScreen — The main coding workspace
 *
 * Integrates the file explorer and code editor into a unified layout.
 * The interface itself becomes the workspace — explorer + editor side by side.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useEditorStore } from '../store/editorStore';
import { useFileStore } from '../store/fileStore';
import { CodeEditor } from '../components/editor/CodeEditor';
import { EditorTabs } from '../components/editor/EditorTabs';
import { FileExplorer } from '../components/explorer/FileExplorer';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import type { ThemeColors } from '../theme/colors';
import { inferLanguage } from '../utils/syntaxTokenizer';

export function EditorScreen() {
  const { colors } = useTheme();
  const { tabs, activeTabId } = useEditorStore();
  const { explorerVisible, setExplorerVisible } = useFileStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const toggleExplorer = useCallback(() => {
    setExplorerVisible(!explorerVisible);
  }, [explorerVisible, setExplorerVisible]);

  const language = activeTab ? inferLanguage(activeTab.filename) : undefined;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Top toolbar */}
      <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={toggleExplorer} style={styles.toolbarButton}>
          <Text style={[styles.toolbarIcon, { color: explorerVisible ? colors.accent : colors.textTertiary }]}>
            📁
          </Text>
        </TouchableOpacity>
        <Text style={[styles.toolbarTitle, { color: colors.textSecondary }]}>
          {activeTab ? activeTab.filename : 'No file open'}
        </Text>
        <TouchableOpacity style={styles.toolbarButton}>
          <Text style={[styles.toolbarIcon, { color: colors.textTertiary }]}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.workspace}>
        {/* File explorer panel */}
        {explorerVisible && (
          <View style={[styles.explorerPanel, { borderRightColor: colors.border }]}>
            <FileExplorer />
          </View>
        )}

        {/* Editor panel */}
        <View style={styles.editorPanel}>
          <EditorTabs />

          {activeTabId ? (
            <CodeEditor
              tabId={activeTabId}
              filename={activeTab?.filename}
              language={language}
            />
          ) : (
            <EmptyEditorState colors={colors} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function EmptyEditorState({ colors }: { colors: ThemeColors }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>✍️</Text>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No file open
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Select a file from the explorer to begin
      </Text>
      <Text style={[styles.emptyQuote, { color: colors.textTertiary }]}>
        {"Every great system is born from a\nthousand small recoveries."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  toolbarButton: {
    padding: Spacing.md,
  },
  toolbarIcon: { fontSize: 18 },
  toolbarTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
    textAlign: 'center',
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
  },
  explorerPanel: {
    width: 220,
    borderRightWidth: 1,
  },
  editorPanel: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing['4xl'],
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.medium,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  emptyQuote: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.fontSize.sm * 1.8,
    marginTop: Spacing['3xl'],
  },
});
