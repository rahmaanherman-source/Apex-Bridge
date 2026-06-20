/**
 * FileExplorer — The territory map of your project
 *
 * Displays the file tree, allows navigation, creation, and deletion.
 * "Makes the invisible visible so you can see exactly where you stand."
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useFileSystem } from '../../hooks/useFileSystem';
import { FileTreeNode } from './FileTreeNode';
import { flattenTree } from '../../utils/fileUtils';
import type { FileNode } from '../../utils/fileUtils';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

export function FileExplorer() {
  const { colors } = useTheme();
  const {
    files,
    selectedFilePath,
    repositoryName,
    openFile,
    toggleDirectory,
    createFile,
    createDirectory,
    deleteFile,
  } = useFileSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const handleFilePress = useCallback(
    (node: FileNode) => openFile(node),
    [openFile],
  );

  const handleDirectoryPress = useCallback((node: FileNode) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(node.path)) {
        next.delete(node.path);
      } else {
        next.add(node.path);
      }
      return next;
    });
  }, []);

  const handleNewFile = useCallback(() => {
    Alert.prompt(
      'New File',
      'Enter file name:',
      (name) => {
        if (name?.trim()) {
          const parent = files[0]?.path ?? '/';
          createFile(parent, name.trim());
        }
      },
      'plain-text',
      '',
    );
  }, [files, createFile]);

  const handleNewFolder = useCallback(() => {
    Alert.prompt(
      'New Folder',
      'Enter folder name:',
      (name) => {
        if (name?.trim()) {
          const parent = files[0]?.path ?? '/';
          createDirectory(parent, name.trim());
        }
      },
      'plain-text',
      '',
    );
  }, [files, createDirectory]);

  // Flatten the tree for search
  const filteredFiles = searchQuery.trim()
    ? flattenTree(files).filter((n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.repoName, { color: colors.textPrimary }]} numberOfLines={1}>
          {repositoryName ?? 'Explorer'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleNewFile} style={styles.headerButton}>
            <Text style={[styles.headerButtonIcon, { color: colors.textSecondary }]}>＋📄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNewFolder} style={styles.headerButton}>
            <Text style={[styles.headerButtonIcon, { color: colors.textSecondary }]}>＋📁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search files..."
          placeholderTextColor={colors.textPlaceholder}
          style={[
            styles.searchInput,
            {
              color: colors.textPrimary,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* File tree */}
      {filteredFiles ? (
        // Search results — flat list
        <FlatList
          data={filteredFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FileTreeNode
              node={item}
              depth={0}
              isExpanded={false}
              isSelected={selectedFilePath === item.path}
              onFilePress={handleFilePress}
              onDirectoryPress={handleDirectoryPress}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No files found
            </Text>
          }
        />
      ) : (
        // Full tree
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FileTreeNode
              node={item}
              depth={0}
              isExpanded={expandedPaths.has(item.path)}
              isSelected={selectedFilePath === item.path}
              onFilePress={handleFilePress}
              onDirectoryPress={handleDirectoryPress}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyIcon]}>📂</Text>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                No files yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Tap ＋📄 to create a new file
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  repoName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerButtonIcon: {
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  searchInput: {
    fontSize: Typography.fontSize.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
    gap: Spacing.md,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
});
