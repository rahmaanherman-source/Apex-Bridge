/**
 * File Store — Zustand
 *
 * Manages the virtual file system tree.
 * When a file changes on disk, the editor reacts instantly.
 * No lag, no spinners — only the pure signal of creation.
 */

import { create } from 'zustand';
import type { FileNode } from '../utils/fileUtils';
import { updateFileContent, findFileByPath, sortFileNodes, generateFileId } from '../utils/fileUtils';

interface FileState {
  /** Root-level file nodes */
  files: FileNode[];
  /** Path of the currently selected file */
  selectedFilePath: string | null;
  /** Paths of expanded directories */
  expandedDirs: Set<string>;
  /** Whether the file explorer is visible */
  explorerVisible: boolean;
  /** Repository name */
  repositoryName: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  setFiles: (files: FileNode[]) => void;
  addFile: (parentPath: string, name: string, type: 'file' | 'directory') => FileNode;
  deleteFile: (filePath: string) => void;
  renameFile: (filePath: string, newName: string) => void;
  updateContent: (fileId: string, content: string) => void;
  selectFile: (path: string | null) => void;
  toggleDirectory: (path: string) => void;
  expandDirectory: (path: string) => void;
  collapseDirectory: (path: string) => void;
  setExplorerVisible: (visible: boolean) => void;
  setRepositoryName: (name: string | null) => void;
  getFileByPath: (path: string) => FileNode | null;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  selectedFilePath: null,
  expandedDirs: new Set(),
  explorerVisible: true,
  repositoryName: null,

  setFiles: (files) => set({ files: sortFileNodes(files) }),

  addFile: (parentPath, name, type) => {
    const path = `${parentPath}/${name}`;
    const newNode: FileNode = {
      id: generateFileId(path),
      name,
      path,
      type,
      modifiedAt: new Date().toISOString(),
      content: type === 'file' ? '' : undefined,
      children: type === 'directory' ? [] : undefined,
      isDirty: false,
    };

    set((state) => {
      function insertNode(nodes: FileNode[]): FileNode[] {
        return nodes.map((n) => {
          if (n.path === parentPath && n.type === 'directory') {
            return {
              ...n,
              children: sortFileNodes([...(n.children ?? []), newNode]),
            };
          }
          if (n.children) return { ...n, children: insertNode(n.children) };
          return n;
        });
      }

      return { files: insertNode(state.files) };
    });

    return newNode;
  },

  deleteFile: (filePath) =>
    set((state) => {
      function removeNode(nodes: FileNode[]): FileNode[] {
        return nodes
          .filter((n) => n.path !== filePath)
          .map((n) => ({
            ...n,
            children: n.children ? removeNode(n.children) : undefined,
          }));
      }

      return {
        files: removeNode(state.files),
        selectedFilePath:
          state.selectedFilePath === filePath ? null : state.selectedFilePath,
      };
    }),

  renameFile: (filePath, newName) =>
    set((state) => {
      function renameNode(nodes: FileNode[]): FileNode[] {
        return nodes.map((n) => {
          if (n.path === filePath) {
            const newPath = filePath.replace(/[^/]+$/, newName);
            return { ...n, name: newName, path: newPath };
          }
          if (n.children) return { ...n, children: renameNode(n.children) };
          return n;
        });
      }
      return { files: renameNode(state.files) };
    }),

  updateContent: (fileId, content) =>
    set((state) => ({
      files: updateFileContent(state.files, fileId, content),
    })),

  selectFile: (path) => set({ selectedFilePath: path }),

  toggleDirectory: (path) =>
    set((state) => {
      const next = new Set(state.expandedDirs);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return { expandedDirs: next };
    }),

  expandDirectory: (path) =>
    set((state) => {
      const next = new Set(state.expandedDirs);
      next.add(path);
      return { expandedDirs: next };
    }),

  collapseDirectory: (path) =>
    set((state) => {
      const next = new Set(state.expandedDirs);
      next.delete(path);
      return { expandedDirs: next };
    }),

  setExplorerVisible: (visible) => set({ explorerVisible: visible }),

  setRepositoryName: (name) => set({ repositoryName: name }),

  getFileByPath: (path) => findFileByPath(get().files, path),
}));
