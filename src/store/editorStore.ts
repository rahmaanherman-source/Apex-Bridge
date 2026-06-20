/**
 * Editor Store — Zustand
 *
 * Manages the state of the code editor: open tabs, active file,
 * cursor positions, and autosave tracking.
 *
 * The editor is a living organism — when a file changes, it reacts instantly.
 */

import { create } from 'zustand';
import type { OpenTab } from '../utils/fileUtils';

interface EditorState {
  /** All currently open tabs */
  tabs: OpenTab[];
  /** ID of the currently active tab */
  activeTabId: string | null;
  /** Whether autosave is enabled */
  autosaveEnabled: boolean;
  /** Timestamp of last autosave */
  lastAutosavedAt: number | null;
  /** Font size preference */
  fontSize: number;
  /** Whether word wrap is enabled */
  wordWrap: boolean;
  /** Whether line numbers are shown */
  showLineNumbers: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────
  openTab: (tab: OpenTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabClean: (tabId: string) => void;
  updateCursorPosition: (tabId: string, line: number, column: number) => void;
  setAutosave: (enabled: boolean) => void;
  recordAutosave: () => void;
  setFontSize: (size: number) => void;
  setWordWrap: (enabled: boolean) => void;
  setShowLineNumbers: (show: boolean) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  closeAllTabs: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  tabs: [],
  activeTabId: null,
  autosaveEnabled: true,
  lastAutosavedAt: null,
  fontSize: 14,
  wordWrap: false,
  showLineNumbers: true,

  openTab: (tab) =>
    set((state) => {
      // If already open, just activate it
      const existing = state.tabs.find((t) => t.fileId === tab.fileId);
      if (existing) {
        return {
          activeTabId: existing.id,
          tabs: state.tabs.map((t) =>
            t.id === existing.id ? { ...t, lastActiveAt: Date.now() } : t,
          ),
        };
      }
      return {
        tabs: [...state.tabs, { ...tab, lastActiveAt: Date.now() }],
        activeTabId: tab.id,
      };
    }),

  closeTab: (tabId) =>
    set((state) => {
      const remainingTabs = state.tabs.filter((t) => t.id !== tabId);
      let newActiveId = state.activeTabId;

      if (state.activeTabId === tabId) {
        // Activate the most recently used remaining tab
        const sorted = [...remainingTabs].sort((a, b) => b.lastActiveAt - a.lastActiveAt);
        newActiveId = sorted[0]?.id ?? null;
      }

      return { tabs: remainingTabs, activeTabId: newActiveId };
    }),

  setActiveTab: (tabId) =>
    set((state) => ({
      activeTabId: tabId,
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, lastActiveAt: Date.now() } : t,
      ),
    })),

  updateTabContent: (tabId, content) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, content, isDirty: true } : t,
      ),
    })),

  markTabClean: (tabId) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, isDirty: false } : t,
      ),
    })),

  updateCursorPosition: (tabId, line, column) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, cursorPosition: { line, column } } : t,
      ),
    })),

  setAutosave: (enabled) => set({ autosaveEnabled: enabled }),

  recordAutosave: () => set({ lastAutosavedAt: Date.now() }),

  setFontSize: (size) => set({ fontSize: Math.max(10, Math.min(24, size)) }),

  setWordWrap: (enabled) => set({ wordWrap: enabled }),

  setShowLineNumbers: (show) => set({ showLineNumbers: show }),

  reorderTabs: (fromIndex, toIndex) =>
    set((state) => {
      const tabs = [...state.tabs];
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { tabs };
    }),

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),
}));
