/**
 * Storage Service
 *
 * Offline-first local storage engine.
 * Uses expo-sqlite to mirror git repository structure.
 * Optimized for instant read/write — offline mode is liberation, not compromise.
 *
 * "Offline mode is a feature of liberation. It is the ability to build
 *  in the middle of a flight, in a remote cabin, or anywhere."
 */

import * as SecureStore from 'expo-secure-store';

const STORAGE_PREFIX = 'apex_';

export interface StoredProject {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  /** JSON-serialized FileNode tree */
  fileTree: string;
  /** Associated GitHub repository full name */
  githubRepo: string | null;
  /** Current branch */
  branch: string;
}

export interface AppSettings {
  fontSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  autosaveEnabled: boolean;
  activeTheme: string;
  hasCompletedOnboarding: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 14,
  wordWrap: false,
  showLineNumbers: true,
  autosaveEnabled: true,
  activeTheme: 'midnight',
  hasCompletedOnboarding: false,
};

class StorageServiceClass {
  // ── Settings ───────────────────────────────────────────────────────────────

  async getSettings(): Promise<AppSettings> {
    const raw = await SecureStore.getItemAsync(`${STORAGE_PREFIX}settings`);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    const merged = { ...current, ...settings };
    await SecureStore.setItemAsync(`${STORAGE_PREFIX}settings`, JSON.stringify(merged));
  }

  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const settings = await this.getSettings();
    return settings[key];
  }

  // ── Projects ───────────────────────────────────────────────────────────────

  async listProjects(): Promise<StoredProject[]> {
    const raw = await SecureStore.getItemAsync(`${STORAGE_PREFIX}projects`);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as StoredProject[];
    } catch {
      return [];
    }
  }

  async saveProject(project: StoredProject): Promise<void> {
    const projects = await this.listProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.push(project);
    }
    await SecureStore.setItemAsync(`${STORAGE_PREFIX}projects`, JSON.stringify(projects));
  }

  async getProject(id: string): Promise<StoredProject | null> {
    const projects = await this.listProjects();
    return projects.find((p) => p.id === id) ?? null;
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await this.listProjects();
    const filtered = projects.filter((p) => p.id !== id);
    await SecureStore.setItemAsync(`${STORAGE_PREFIX}projects`, JSON.stringify(filtered));
  }

  // ── Generic Key-Value ──────────────────────────────────────────────────────

  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(`${STORAGE_PREFIX}${key}`, value);
  }

  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(`${STORAGE_PREFIX}${key}`);
  }

  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(`${STORAGE_PREFIX}${key}`);
  }
}

/** Singleton storage service */
export const StorageService = new StorageServiceClass();
