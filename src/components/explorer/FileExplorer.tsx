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
  Modal,
  TouchableOpacity,
  Pressable,
  FlatList,
  StyleSheet,
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
    expandedDirs,
    repositoryName,
    openFile,
    toggleDirectory,
    createFile,
    createDirectory,
  } = useFileSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [draftName, setDraftName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<'file' | 'directory' | null>(null);

  const handleFilePress = useCallback(
    (node: FileNode) => openFile(node),
    [openFile],
  );

  const handleDirectoryPress = useCallback((node: FileNode) => {
    toggleDirectory(node.path);
  }, [toggleDirectory]);

  const handleNewFile = useCallback(() => {
    setDraftName('');
    setCreateError(null);
    setCreateMode('file');
  }, []);

  const handleNewFolder = useCallback(() => {
    setDraftName('');
    setCreateError(null);
    setCreateMode('directory');
  }, []);

  const closeCreateModal = useCallback(() => {
    setDraftName('');
    setCreateError(null);
    setCreateMode(null);
  }, []);

  const submitCreate = useCallback(() => {
    const trimmed = draftName.trim();
    if (!createMode) return;
    if (!trimmed) {
      setCreateError('Name is required.');
      return;
    }

    const parent = files[0]?.path ?? '/';
    try {
      if (createMode === 'file') {
        createFile(parent, trimmed);
      } else {
        createDirectory(parent, trimmed);
      }
      closeCreateModal();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Unable to create the item.',
      );
    }
  }, [closeCreateModal, createDirectory, createFile, createMode, draftName, files]);

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
              expandedPaths={expandedDirs}
              selectedPath={selectedFilePath}
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
              expandedPaths={expandedDirs}
              selectedPath={selectedFilePath}
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

      <Modal
        animationType="fade"
        transparent
        visible={createMode !== null}
        onRequestClose={closeCreateModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeCreateModal}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {createMode === 'file' ? 'New File' : 'New Folder'}
            </Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder={createMode === 'file' ? 'example.ts' : 'src'}
              placeholderTextColor={colors.textPlaceholder}
              style={[
                styles.modalInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={submitCreate}
            />
            {createError ? (
              <Text style={[styles.modalError, { color: colors.rose }]}>{createError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeCreateModal} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitCreate} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, { color: colors.accent }]}>Create</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  modalInput: {
    fontSize: Typography.fontSize.base,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
  },
  modalError: {
    fontSize: Typography.fontSize.sm,
  },
  modalButton: {
    paddingVertical: Spacing.sm,
  },
  modalButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
