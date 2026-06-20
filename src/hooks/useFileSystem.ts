/**
 * useFileSystem — File tree interaction hook
 *
 * Provides actions for working with the virtual file system.
 */

import { useCallback } from 'react';
import { useFileStore } from '../store/fileStore';
import { useEditorStore } from '../store/editorStore';
import { generateFileId, inferLanguage } from '../utils/fileUtils';
import type { OpenTab } from '../utils/fileUtils';

export function useFileSystem() {
  const {
    files,
    selectedFilePath,
    expandedDirs,
    explorerVisible,
    repositoryName,
    selectFile,
    toggleDirectory,
    setFiles,
    addFile,
    deleteFile,
    renameFile,
    setExplorerVisible,
  } = useFileStore();

  const { openTab } = useEditorStore();

  /** Opens a file in the editor by creating/activating a tab */
  const openFile = useCallback(
    (fileNode: { id: string; name: string; path: string; content?: string }) => {
      const tab: OpenTab = {
        id: generateFileId(`tab_${fileNode.id}`),
        fileId: fileNode.id,
        filename: fileNode.name,
        path: fileNode.path,
        content: fileNode.content ?? '',
        isDirty: false,
        lastActiveAt: Date.now(),
      };
      openTab(tab);
      selectFile(fileNode.path);
    },
    [openTab, selectFile],
  );

  /** Creates a new file in the explorer */
  const createFile = useCallback(
    (parentPath: string, name: string) => {
      const node = addFile(parentPath, name, 'file');
      openFile(node);
      return node;
    },
    [addFile, openFile],
  );

  /** Creates a new directory in the explorer */
  const createDirectory = useCallback(
    (parentPath: string, name: string) => {
      return addFile(parentPath, name, 'directory');
    },
    [addFile],
  );

  return {
    files,
    selectedFilePath,
    expandedDirs,
    explorerVisible,
    repositoryName,
    openFile,
    createFile,
    createDirectory,
    deleteFile,
    renameFile,
    toggleDirectory,
    setFiles,
    setExplorerVisible,
  };
}
