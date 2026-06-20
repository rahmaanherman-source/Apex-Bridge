/**
 * GitHub Service
 *
 * Handles all GitHub API interactions: OAuth, repo management,
 * file operations, pull/push/merge operations.
 *
 * The authentication flow feels like a handoff — not a login wall.
 * Sync History is a timeline of progress, a narrative of the work being done.
 */

import { VaultService } from './VaultService';
import type { GitHubUser, GitHubRepo } from '../store/authStore';
import type { SyncRecord } from '../utils/gitUtils';
import { StorageService } from './StorageService';

const GITHUB_API_BASE = 'https://api.github.com';
const SYNC_HISTORY_KEY = 'sync_history';

export interface GitHubFileContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
  sha: string;
  size: number;
  downloadUrl: string | null;
}

export interface CreateFileParams {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string;
  branch?: string;
  sha?: string;
}

class GitHubServiceClass {
  private async getToken(): Promise<string | null> {
    return VaultService.getSecretByService('github');
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    return headers;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.authHeaders();
    const url = path.startsWith('http') ? path : `${GITHUB_API_BASE}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...((options.headers as Record<string, string>) ?? {}) },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // ── Authentication ─────────────────────────────────────────────────────────

  /**
   * Validates a GitHub Personal Access Token and returns the user profile.
   * Used during the OAuth-like handshake flow.
   */
  async validateToken(token: string): Promise<GitHubUser> {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Invalid token or insufficient permissions');
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      id: data['id'] as number,
      login: data['login'] as string,
      name: data['name'] as string | null,
      email: data['email'] as string | null,
      avatarUrl: data['avatar_url'] as string,
      bio: data['bio'] as string | null,
      publicRepos: data['public_repos'] as number,
    };
  }

  /** Stores the GitHub token in the vault */
  async storeToken(token: string): Promise<void> {
    // Remove any existing GitHub token
    const entries = await VaultService.listEntries();
    const existing = entries.find((e) => e.service === 'github');
    if (existing) {
      await VaultService.updateSecret(existing.id, token);
    } else {
      await VaultService.storeSecret('GitHub Personal Access Token', 'github', token);
    }
  }

  // ── Repositories ──────────────────────────────────────────────────────────

  async listRepositories(): Promise<GitHubRepo[]> {
    const data = await this.fetch<Record<string, unknown>[]>('/user/repos?sort=updated&per_page=50');
    return data.map((r) => ({
      id: r['id'] as number,
      fullName: r['full_name'] as string,
      name: r['name'] as string,
      owner: (r['owner'] as Record<string, unknown>)['login'] as string,
      description: r['description'] as string | null,
      defaultBranch: r['default_branch'] as string,
      isPrivate: r['private'] as boolean,
      language: r['language'] as string | null,
      updatedAt: r['updated_at'] as string,
      htmlUrl: r['html_url'] as string,
      cloneUrl: r['clone_url'] as string,
    }));
  }

  // ── File Operations ────────────────────────────────────────────────────────

  async listContents(
    owner: string,
    repo: string,
    path: string = '',
    branch?: string,
  ): Promise<GitHubFileContent[]> {
    const query = branch ? `?ref=${branch}` : '';
    const url = `/repos/${owner}/${repo}/contents/${path}${query}`;
    const data = await this.fetch<Record<string, unknown>[]>(url);
    return data.map((item) => ({
      name: item['name'] as string,
      path: item['path'] as string,
      type: (item['type'] === 'dir' ? 'dir' : 'file') as 'file' | 'dir',
      content: item['content'] as string | undefined,
      encoding: item['encoding'] as string | undefined,
      sha: item['sha'] as string,
      size: item['size'] as number,
      downloadUrl: item['download_url'] as string | null,
    }));
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch?: string,
  ): Promise<{ content: string; sha: string }> {
    const query = branch ? `?ref=${branch}` : '';
    const data = await this.fetch<Record<string, unknown>>(`/repos/${owner}/${repo}/contents/${path}${query}`);

    const rawContent = data['content'] as string;
    const encoding = data['encoding'] as string;

    let content = rawContent;
    if (encoding === 'base64') {
      content = atob(rawContent.replace(/\n/g, ''));
    }

    return { content, sha: data['sha'] as string };
  }

  async createOrUpdateFile(params: CreateFileParams): Promise<void> {
    const { owner, repo, path, message, content, branch, sha } = params;
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    await this.fetch(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: encodedContent,
        branch,
        sha,
      }),
    });
  }

  // ── Branch Operations ──────────────────────────────────────────────────────

  async listBranches(owner: string, repo: string): Promise<string[]> {
    const data = await this.fetch<Record<string, unknown>[]>(`/repos/${owner}/${repo}/branches`);
    return data.map((b) => b['name'] as string);
  }

  // ── Sync History ──────────────────────────────────────────────────────────

  async recordSync(record: Omit<SyncRecord, 'id'>): Promise<SyncRecord> {
    const id = Math.random().toString(36).slice(2);
    const full: SyncRecord = { ...record, id };

    const history = await this.getSyncHistory();
    history.unshift(full);
    // Keep the last 100 records
    const trimmed = history.slice(0, 100);
    await StorageService.set(SYNC_HISTORY_KEY, JSON.stringify(trimmed));

    return full;
  }

  async getSyncHistory(): Promise<SyncRecord[]> {
    const raw = await StorageService.get(SYNC_HISTORY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as SyncRecord[];
    } catch {
      return [];
    }
  }

  async clearSyncHistory(): Promise<void> {
    await StorageService.delete(SYNC_HISTORY_KEY);
  }
}

/** Singleton GitHub service */
export const GitHubService = new GitHubServiceClass();
