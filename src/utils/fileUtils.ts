/**
 * File Utilities
 *
 * Helpers for working with the virtual file system.
 * The file system is your map of the territory — make it clear.
 */

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  /** ISO timestamp of last modification */
  modifiedAt: string;
  /** Whether the file has unsaved changes */
  isDirty?: boolean;
  /** Size in bytes */
  size?: number;
  /** Language inferred from extension */
  language?: string;
}

export interface OpenTab {
  id: string;
  fileId: string;
  filename: string;
  path: string;
  content: string;
  isDirty: boolean;
  /** Cursor position for restoration on tab switch */
  cursorPosition?: { line: number; column: number };
  /** Scroll position for restoration */
  scrollOffset?: number;
  /** How recently active — used by Flow Tabs radial model */
  lastActiveAt: number;
}

/** Common file icons by extension */
export const FILE_ICONS: Record<string, string> = {
  ts: '🔷',
  tsx: '⚛️',
  js: '🟨',
  jsx: '⚛️',
  py: '🐍',
  json: '📋',
  md: '📝',
  css: '🎨',
  scss: '🎨',
  html: '🌐',
  yml: '⚙️',
  yaml: '⚙️',
  sh: '💻',
  txt: '📄',
  gitignore: '🚫',
  directory: '📁',
  directoryOpen: '📂',
};

/** Returns the icon for a given filename or type */
export function getFileIcon(name: string, isDirectory = false): string {
  if (isDirectory) return FILE_ICONS['directory'];
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (name.startsWith('.')) return FILE_ICONS[name.slice(1)] ?? '📄';
  return FILE_ICONS[ext] ?? '📄';
}

/** Generates a unique ID for a file node */
export function generateFileId(path: string): string {
  return `file_${btoa(path).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}_${Date.now()}`;
}

/** Formats a byte count into human-readable form */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Sorts file nodes — directories first, then alphabetically */
export function sortFileNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/** Finds a file node by path in a tree */
export function findFileByPath(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFileByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

/** Updates file content in a tree immutably */
export function updateFileContent(
  nodes: FileNode[],
  fileId: string,
  content: string,
): FileNode[] {
  return nodes.map((node) => {
    if (node.id === fileId) {
      return { ...node, content, modifiedAt: new Date().toISOString(), isDirty: true };
    }
    if (node.children) {
      return { ...node, children: updateFileContent(node.children, fileId, content) };
    }
    return node;
  });
}

/** Flattens a file tree into a flat array */
export function flattenTree(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  function traverse(ns: FileNode[]) {
    for (const n of ns) {
      result.push(n);
      if (n.children) traverse(n.children);
    }
  }
  traverse(nodes);
  return result;
}

/** Creates a sample "welcome" project for new users */
export function createWelcomeProject(): FileNode {
  const now = new Date().toISOString();
  return {
    id: 'root',
    name: 'my-first-project',
    path: '/my-first-project',
    type: 'directory',
    modifiedAt: now,
    children: [
      {
        id: 'readme',
        name: 'README.md',
        path: '/my-first-project/README.md',
        type: 'file',
        modifiedAt: now,
        language: 'markdown',
        content: `# My First Project\n\nWelcome to Apex Bridge! 🌉\n\n> *"A calm mobile workspace for building, syncing, and moving your ideas forward."*\n\n## Getting Started\n\nThis is your first project. Edit this file, create new ones, and when you're ready — sync to GitHub.\n\nYou are exactly where you need to be.\n`,
      },
      {
        id: 'src-dir',
        name: 'src',
        path: '/my-first-project/src',
        type: 'directory',
        modifiedAt: now,
        children: [
          {
            id: 'index-ts',
            name: 'index.ts',
            path: '/my-first-project/src/index.ts',
            type: 'file',
            modifiedAt: now,
            language: 'typescript',
            content: `/**\n * Hello, Apex Bridge!\n *\n * This is your first TypeScript file.\n * Every line here is a small act of progress.\n */\n\nconst greeting = 'Welcome to Apex Bridge';\n\nfunction connect(message: string): void {\n  console.log(\`🌉  \${message}\`);\n}\n\nconnect(greeting);\n`,
          },
        ],
      },
    ],
  };
}
