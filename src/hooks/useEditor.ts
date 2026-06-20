/**
 * useEditor — Code editor state hook
 *
 * Connects a tab ID to the editor store and autosave service.
 * Every keystroke is captured — the creative impulse is never lost.
 */

import { useCallback, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { AutosaveService } from '../services/AutosaveService';

export function useEditor(tabId: string | null) {
  const {
    tabs,
    activeTabId,
    autosaveEnabled,
    fontSize,
    wordWrap,
    showLineNumbers,
    updateTabContent,
    markTabClean,
    updateCursorPosition,
    recordAutosave,
  } = useEditorStore();

  const activeTab = tabId ? tabs.find((t) => t.id === tabId) : null;

  // Wire autosave callback when component mounts
  useEffect(() => {
    AutosaveService.onSave((savedTabId) => {
      markTabClean(savedTabId);
      recordAutosave();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContentChange = useCallback(
    (content: string) => {
      if (!tabId) return;
      updateTabContent(tabId, content);

      if (autosaveEnabled && activeTab) {
        AutosaveService.schedule(tabId, activeTab.fileId, content);
      }
    },
    [tabId, activeTab, autosaveEnabled, updateTabContent],
  );

  const handleCursorChange = useCallback(
    (line: number, column: number) => {
      if (!tabId) return;
      updateCursorPosition(tabId, line, column);
    },
    [tabId, updateCursorPosition],
  );

  return {
    tab: activeTab,
    content: activeTab?.content ?? '',
    isDirty: activeTab?.isDirty ?? false,
    cursorPosition: activeTab?.cursorPosition,
    isActive: activeTabId === tabId,
    fontSize,
    wordWrap,
    showLineNumbers,
    handleContentChange,
    handleCursorChange,
  };
}
