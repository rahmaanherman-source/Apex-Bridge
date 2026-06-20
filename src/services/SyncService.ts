/**
 * Sync Service
 *
 * Orchestrates GitHub sync operations: pull, push, merge.
 * Transforms the stressful process of version control into a
 * collaborative dialogue — merge conflicts are conversations, not errors.
 */

import { GitHubService } from './GitHubService';
import { AutosaveService } from './AutosaveService';
import type { GitHubRepo } from '../store/authStore';
import type { FileNode } from '../utils/fileUtils';

export type SyncOperation = 'pull' | 'push' | 'merge';

export interface SyncProgress {
  operation: SyncOperation;
  phase: 'preparing' | 'fetching' | 'applying' | 'complete' | 'error';
  progress: number;
  message: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

class SyncServiceClass {
  /**
   * Pulls the latest content from a GitHub repository.
   * Returns the file tree from the remote.
   */
  async pull(
    repo: GitHubRepo,
    branch: string,
    onProgress?: SyncProgressCallback,
  ): Promise<FileNode[]> {
    onProgress?.({ operation: 'pull', phase: 'preparing', progress: 0, message: 'Preparing to pull...' });

    // Flush any pending autosaves first
    await AutosaveService.flushAll();

    onProgress?.({ operation: 'pull', phase: 'fetching', progress: 20, message: 'Fetching repository contents...' });

    const rootContents = await GitHubService.listContents(repo.owner, repo.name, '', branch);

    onProgress?.({ operation: 'pull', phase: 'applying', progress: 60, message: 'Building file tree...' });

    const fileTree = await this.buildFileTree(
      repo.owner,
      repo.name,
      branch,
      rootContents,
      `/${repo.name}`,
    );

    await GitHubService.recordSync({
      type: 'pull',
      status: 'success',
      timestamp: new Date().toISOString(),
      branch,
      message: `Pulled from ${repo.fullName}`,
      filesChanged: fileTree.length,
    });

    onProgress?.({ operation: 'pull', phase: 'complete', progress: 100, message: 'Pull complete!' });

    return fileTree;
  }

  /**
   * Pushes local file changes to GitHub.
   */
  async push(
    repo: GitHubRepo,
    branch: string,
    files: Array<{ path: string; content: string; sha?: string }>,
    commitMessage: string,
    onProgress?: SyncProgressCallback,
  ): Promise<void> {
    onProgress?.({ operation: 'push', phase: 'preparing', progress: 0, message: 'Preparing push...' });

    // Flush all autosaves before pushing
    await AutosaveService.flushAll();

    const total = files.length;
    for (let i = 0; i < total; i++) {
      const file = files[i];
      onProgress?.({
        operation: 'push',
        phase: 'applying',
        progress: Math.round(((i + 1) / total) * 80),
        message: `Pushing ${file.path}...`,
      });

      await GitHubService.createOrUpdateFile({
        owner: repo.owner,
        repo: repo.name,
        path: file.path.replace(`/${repo.name}/`, ''),
        message: commitMessage,
        content: file.content,
        branch,
        sha: file.sha,
      });
    }

    await GitHubService.recordSync({
      type: 'push',
      status: 'success',
      timestamp: new Date().toISOString(),
      branch,
      message: commitMessage,
      filesChanged: files.length,
    });

    onProgress?.({ operation: 'push', phase: 'complete', progress: 100, message: 'Push complete!' });
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private async buildFileTree(
    owner: string,
    repo: string,
    branch: string,
    contents: Awaited<ReturnType<typeof GitHubService.listContents>>,
    basePath: string,
  ): Promise<FileNode[]> {
    const { generateFileId, inferLanguage } = await import('../utils/fileUtils').then(
      (m) => ({ generateFileId: m.generateFileId, inferLanguage: (name: string) => name }),
    );

    const nodes: FileNode[] = [];

    for (const item of contents) {
      const nodePath = `${basePath}/${item.name}`;
      const now = new Date().toISOString();

      if (item.type === 'dir') {
        // Recursively fetch directory contents (limit depth to avoid API rate limits)
        let children: FileNode[] = [];
        try {
          const subContents = await GitHubService.listContents(owner, repo, item.path, branch);
          children = await this.buildFileTree(owner, repo, branch, subContents, nodePath);
        } catch {
          // Graceful degradation — directory will show but be empty
        }

        nodes.push({
          id: generateFileId(nodePath),
          name: item.name,
          path: nodePath,
          type: 'directory',
          modifiedAt: now,
          children,
        });
      } else {
        nodes.push({
          id: generateFileId(nodePath),
          name: item.name,
          path: nodePath,
          type: 'file',
          modifiedAt: now,
          size: item.size,
        });
      }
    }

    return nodes;
  }
}

/** Singleton sync service */
export const SyncService = new SyncServiceClass();
