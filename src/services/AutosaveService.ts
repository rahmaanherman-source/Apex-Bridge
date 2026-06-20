/**
 * Autosave Service
 *
 * Continuous autosave — every creative impulse is captured.
 * "Autosave should not be a periodic checkpoint; it should be continuous,
 *  capturing every keystroke in real-time, ensuring that the creative
 *  impulse is never lost to a crash."
 */

import { StorageService } from './StorageService';

/** Debounce delay in milliseconds — saves after user stops typing */
const AUTOSAVE_DEBOUNCE_MS = 1500;

interface PendingSave {
  tabId: string;
  fileId: string;
  content: string;
  timer: ReturnType<typeof setTimeout>;
}

class AutosaveServiceClass {
  private pending: Map<string, PendingSave> = new Map();
  private enabled: boolean = true;
  private onSaveCallback: ((tabId: string, fileId: string) => void) | null = null;

  /** Registers a callback to be called after each successful save */
  onSave(callback: (tabId: string, fileId: string) => void): void {
    this.onSaveCallback = callback;
  }

  /** Enables or disables autosave */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.cancelAll();
  }

  /**
   * Schedules an autosave for the given tab.
   * Debounces — only saves after the user pauses typing.
   */
  schedule(tabId: string, fileId: string, content: string): void {
    if (!this.enabled) return;

    // Cancel any existing timer for this tab
    const existing = this.pending.get(tabId);
    if (existing) clearTimeout(existing.timer);

    const timer = setTimeout(() => {
      this.executeSave(tabId, fileId, content);
    }, AUTOSAVE_DEBOUNCE_MS);

    this.pending.set(tabId, { tabId, fileId, content, timer });
  }

  /** Immediately saves all pending changes */
  async flushAll(): Promise<void> {
    const saves = Array.from(this.pending.values());
    for (const save of saves) {
      clearTimeout(save.timer);
      await this.executeSave(save.tabId, save.fileId, save.content);
    }
  }

  /** Cancels a pending save for a specific tab */
  cancel(tabId: string): void {
    const existing = this.pending.get(tabId);
    if (existing) {
      clearTimeout(existing.timer);
      this.pending.delete(tabId);
    }
  }

  /** Cancels all pending saves */
  cancelAll(): void {
    for (const save of this.pending.values()) {
      clearTimeout(save.timer);
    }
    this.pending.clear();
  }

  private async executeSave(tabId: string, fileId: string, content: string): Promise<void> {
    this.pending.delete(tabId);
    try {
      // Persist the content to local storage
      await StorageService.set(`file_content_${fileId}`, content);
      // Record save timestamp
      await StorageService.set(`file_saved_${fileId}`, new Date().toISOString());

      this.onSaveCallback?.(tabId, fileId);
    } catch (error) {
      // Silent fail — we will retry on next keystroke
      console.warn('[AutosaveService] Save failed:', error);
    }
  }

  /** Returns the last saved content for a file */
  async getLastSaved(fileId: string): Promise<string | null> {
    return StorageService.get(`file_content_${fileId}`);
  }

  /** Returns the timestamp of the last save for a file */
  async getLastSavedAt(fileId: string): Promise<string | null> {
    return StorageService.get(`file_saved_${fileId}`);
  }
}

/** Singleton autosave service */
export const AutosaveService = new AutosaveServiceClass();
