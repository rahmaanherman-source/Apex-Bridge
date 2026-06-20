/**
 * Git Utilities
 *
 * Helpers for working with GitHub API responses and git concepts.
 * Merge conflicts are conversations to be resolved, not errors to fear.
 */

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  email: string;
  timestamp: string;
  additions: number;
  deletions: number;
}

export interface GitBranch {
  name: string;
  sha: string;
  isDefault: boolean;
  isProtected: boolean;
}

export interface SyncRecord {
  id: string;
  type: 'push' | 'pull' | 'merge' | 'clone';
  status: 'success' | 'failure' | 'conflict';
  timestamp: string;
  branch: string;
  commitSha?: string;
  message: string;
  filesChanged?: number;
}

export interface MergeConflict {
  filePath: string;
  /** Lines from the local version */
  ours: string[];
  /** Lines from the remote version */
  theirs: string[];
  /** Line number where conflict begins */
  startLine: number;
}

/** Parses a GitHub repository URL to extract owner and repo name */
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com[/:]([\w-]+)\/([\w.-]+?)(?:\.git)?(?:\/|$)/,
    /^([\w-]+)\/([\w.-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }
  return null;
}

/** Formats a commit message for display — truncates if too long */
export function formatCommitMessage(message: string, maxLength = 60): string {
  const firstLine = message.split('\n')[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.slice(0, maxLength - 3) + '...';
}

/** Formats a relative timestamp (e.g., "3 minutes ago") */
export function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(isoTimestamp).toLocaleDateString();
}

/** Returns a color for a sync record status */
export function getSyncStatusColor(status: SyncRecord['status']): string {
  switch (status) {
    case 'success': return '#a5d6a7';
    case 'failure': return '#f48fb1';
    case 'conflict': return '#ffcc80';
  }
}

/** Returns an emoji for a sync record type */
export function getSyncTypeIcon(type: SyncRecord['type']): string {
  switch (type) {
    case 'push': return '⬆️';
    case 'pull': return '⬇️';
    case 'merge': return '🔀';
    case 'clone': return '📋';
  }
}

/** Creates a human-readable sync summary */
export function formatSyncSummary(record: SyncRecord): string {
  const icon = getSyncTypeIcon(record.type);
  const action = record.type.charAt(0).toUpperCase() + record.type.slice(1);
  const files = record.filesChanged ? ` · ${record.filesChanged} files` : '';
  return `${icon} ${action} on ${record.branch}${files}`;
}

/** Generates a default commit message based on context */
export function generateCommitMessage(
  type: 'add' | 'update' | 'fix' | 'remove',
  subject: string,
): string {
  const prefixes = {
    add: 'feat',
    update: 'chore',
    fix: 'fix',
    remove: 'refactor',
  };
  return `${prefixes[type]}: ${subject}`;
}

/** Checks whether two strings have merge conflicts (heuristic) */
export function hasConflictMarkers(content: string): boolean {
  return content.includes('<<<<<<<') && content.includes('>>>>>>>');
}

/** Extracts conflict regions from a file with conflict markers */
export function extractConflicts(content: string): MergeConflict[] {
  const conflicts: MergeConflict[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    if (lines[i].startsWith('<<<<<<<')) {
      const start = i;
      const ours: string[] = [];
      const theirs: string[] = [];
      let inOurs = true;
      i++;

      while (i < lines.length && !lines[i].startsWith('>>>>>>>')) {
        if (lines[i].startsWith('=======')) {
          inOurs = false;
        } else if (inOurs) {
          ours.push(lines[i]);
        } else {
          theirs.push(lines[i]);
        }
        i++;
      }

      conflicts.push({
        filePath: '',
        ours,
        theirs,
        startLine: start,
      });
    }
    i++;
  }

  return conflicts;
}
