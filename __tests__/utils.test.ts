/**
 * Utility tests for Apex Breeze
 *
 * Tests for pure utility functions: encryption, tokenizer, file utils, git utils.
 * These tests do NOT require a device or Expo runtime.
 */

import {
  encrypt,
  decrypt,
  serializePayload,
  deserializePayload,
  generateRandomKey,
  sha256,
} from '../src/utils/encryption';

import {
  tokenize,
  inferLanguage,
} from '../src/utils/syntaxTokenizer';

import {
  formatFileSize,
  sortFileNodes,
  flattenTree,
  createWelcomeProject,
  getFileIcon,
  type FileNode,
} from '../src/utils/fileUtils';

import {
  parseRepoUrl,
  formatCommitMessage,
  formatRelativeTime,
  hasConflictMarkers,
  extractConflicts,
  generateCommitMessage,
} from '../src/utils/gitUtils';

// ── Encryption Tests ─────────────────────────────────────────────────────────

describe('Encryption Utilities', () => {
  const passphrase = 'test-passphrase-apex-breeze';
  const plaintext = 'ghp_secret_github_token_here_1234567890';

  it('encrypts and decrypts a string correctly', () => {
    const payload = encrypt(plaintext, passphrase);
    const result = decrypt(payload, passphrase);
    expect(result).toBe(plaintext);
  });

  it('produces different ciphertext for same plaintext (random IV/salt)', () => {
    const payload1 = encrypt(plaintext, passphrase);
    const payload2 = encrypt(plaintext, passphrase);
    expect(payload1.ciphertext).not.toBe(payload2.ciphertext);
    expect(payload1.iv).not.toBe(payload2.iv);
    expect(payload1.salt).not.toBe(payload2.salt);
  });

  it('returns null when decryption fails with wrong passphrase', () => {
    const payload = encrypt(plaintext, passphrase);
    const result = decrypt(payload, 'wrong-passphrase');
    expect(result).toBeNull();
  });

  it('serializes and deserializes payload correctly', () => {
    const payload = encrypt(plaintext, passphrase);
    const serialized = serializePayload(payload);
    const deserialized = deserializePayload(serialized);

    expect(deserialized).not.toBeNull();
    expect(deserialized!.algorithm).toBe('AES-256-CBC-PBKDF2');
    expect(deserialized!.ciphertext).toBe(payload.ciphertext);
  });

  it('generates a random key of specified length', () => {
    const key = generateRandomKey(32);
    // Each byte → 2 hex chars, so 32 bytes → 64 hex chars
    expect(key.length).toBe(64);
    expect(key).toMatch(/^[0-9a-f]+$/);
  });

  it('generates consistent SHA-256 hashes', () => {
    const hash1 = sha256('test-input');
    const hash2 = sha256('test-input');
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('generates different hashes for different inputs', () => {
    expect(sha256('input-a')).not.toBe(sha256('input-b'));
  });
});

// ── Syntax Tokenizer Tests ────────────────────────────────────────────────────

describe('Syntax Tokenizer', () => {
  describe('inferLanguage', () => {
    it('infers TypeScript from .ts extension', () => {
      expect(inferLanguage('app.ts')).toBe('typescript');
    });

    it('infers TypeScript from .tsx extension', () => {
      expect(inferLanguage('Component.tsx')).toBe('typescript');
    });

    it('infers JavaScript from .js extension', () => {
      expect(inferLanguage('script.js')).toBe('javascript');
    });

    it('infers Python from .py extension', () => {
      expect(inferLanguage('main.py')).toBe('python');
    });

    it('infers JSON from .json extension', () => {
      expect(inferLanguage('package.json')).toBe('json');
    });

    it('falls back to text for unknown extensions', () => {
      expect(inferLanguage('file.xyz')).toBe('text');
    });
  });

  describe('tokenize TypeScript', () => {
    it('tokenizes a keyword correctly', () => {
      const lines = tokenize('const x = 1;', 'typescript');
      const firstLine = lines[0];
      const keywordToken = firstLine.find((t) => t.value === 'const');
      expect(keywordToken?.type).toBe('keyword');
    });

    it('tokenizes a string correctly', () => {
      const lines = tokenize('"hello world"', 'typescript');
      const firstLine = lines[0];
      const stringToken = firstLine.find((t) => t.type === 'string');
      expect(stringToken).toBeTruthy();
      expect(stringToken?.value).toContain('hello world');
    });

    it('tokenizes a comment correctly', () => {
      const lines = tokenize('// this is a comment', 'typescript');
      const commentToken = lines[0].find((t) => t.type === 'comment');
      expect(commentToken).toBeTruthy();
    });

    it('tokenizes a number correctly', () => {
      const lines = tokenize('42', 'typescript');
      const numToken = lines[0].find((t) => t.type === 'number');
      expect(numToken?.value).toBe('42');
    });

    it('handles multiple lines', () => {
      const code = 'const a = 1;\nconst b = 2;';
      const lines = tokenize(code, 'typescript');
      expect(lines.length).toBe(2);
    });

    it('handles empty code', () => {
      const lines = tokenize('', 'typescript');
      expect(lines.length).toBe(1);
      expect(lines[0]).toEqual([]);
    });
  });

  describe('tokenize Python', () => {
    it('tokenizes Python keywords', () => {
      const lines = tokenize('def hello():', 'python');
      const defToken = lines[0].find((t) => t.value === 'def');
      expect(defToken?.type).toBe('keyword');
    });

    it('tokenizes Python comments', () => {
      const lines = tokenize('# comment', 'python');
      const commentToken = lines[0].find((t) => t.type === 'comment');
      expect(commentToken).toBeTruthy();
    });
  });

  describe('tokenize JSON', () => {
    it('tokenizes JSON booleans', () => {
      const lines = tokenize('true', 'json');
      const trueToken = lines[0].find((t) => t.value === 'true');
      expect(trueToken?.type).toBe('keyword');
    });

    it('tokenizes JSON numbers', () => {
      const lines = tokenize('42.5', 'json');
      const numToken = lines[0].find((t) => t.type === 'number');
      expect(numToken?.value).toBe('42.5');
    });
  });
});

// ── File Utils Tests ──────────────────────────────────────────────────────────

describe('File Utilities', () => {
  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(512)).toBe('512 B');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
    });
  });

  describe('sortFileNodes', () => {
    const nodes: FileNode[] = [
      { id: '1', name: 'zebra.ts', path: '/z', type: 'file', modifiedAt: '' },
      { id: '2', name: 'alpha', path: '/a', type: 'directory', modifiedAt: '' },
      { id: '3', name: 'apple.ts', path: '/ap', type: 'file', modifiedAt: '' },
    ];

    it('sorts directories before files', () => {
      const sorted = sortFileNodes(nodes);
      expect(sorted[0].type).toBe('directory');
    });

    it('sorts alphabetically within type groups', () => {
      const sorted = sortFileNodes(nodes);
      const fileNames = sorted.filter((n) => n.type === 'file').map((n) => n.name);
      expect(fileNames).toEqual(['apple.ts', 'zebra.ts']);
    });
  });

  describe('flattenTree', () => {
    it('flattens a nested tree to a flat array', () => {
      const tree: FileNode[] = [
        {
          id: '1',
          name: 'src',
          path: '/src',
          type: 'directory',
          modifiedAt: '',
          children: [
            { id: '2', name: 'index.ts', path: '/src/index.ts', type: 'file', modifiedAt: '' },
          ],
        },
      ];

      const flat = flattenTree(tree);
      expect(flat.length).toBe(2);
      expect(flat.map((n) => n.name)).toContain('index.ts');
    });
  });

  describe('getFileIcon', () => {
    it('returns directory icon for directories', () => {
      expect(getFileIcon('src', true)).toBe('📁');
    });

    it('returns TypeScript icon for .ts files', () => {
      expect(getFileIcon('app.ts')).toBe('🔷');
    });

    it('returns a fallback for unknown extensions', () => {
      expect(getFileIcon('file.xyz')).toBe('📄');
    });
  });

  describe('createWelcomeProject', () => {
    it('creates a valid project structure', () => {
      const project = createWelcomeProject();
      expect(project.type).toBe('directory');
      expect(project.children).toBeTruthy();
      expect(project.children!.length).toBeGreaterThan(0);
    });

    it('includes a README.md', () => {
      const project = createWelcomeProject();
      const readme = project.children!.find((n) => n.name === 'README.md');
      expect(readme).toBeTruthy();
      expect(readme?.content).toContain('Apex Breeze');
    });
  });
});

// ── Git Utils Tests ───────────────────────────────────────────────────────────

describe('Git Utilities', () => {
  describe('parseRepoUrl', () => {
    it('parses HTTPS GitHub URL', () => {
      const result = parseRepoUrl('https://github.com/owner/repo');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    it('parses short owner/repo format', () => {
      const result = parseRepoUrl('owner/my-repo');
      expect(result).toEqual({ owner: 'owner', repo: 'my-repo' });
    });

    it('handles .git suffix', () => {
      const result = parseRepoUrl('https://github.com/owner/repo.git');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    it('returns null for invalid URLs', () => {
      expect(parseRepoUrl('not-a-url')).toBeNull();
    });
  });

  describe('formatCommitMessage', () => {
    it('returns short messages unchanged', () => {
      expect(formatCommitMessage('fix: typo')).toBe('fix: typo');
    });

    it('truncates long messages', () => {
      const long = 'a'.repeat(80);
      const result = formatCommitMessage(long);
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result.endsWith('...')).toBe(true);
    });

    it('uses only the first line of multi-line messages', () => {
      const multiline = 'First line\n\nDetails here';
      expect(formatCommitMessage(multiline)).toBe('First line');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats recent timestamps as "just now"', () => {
      const recent = new Date(Date.now() - 5000).toISOString();
      expect(formatRelativeTime(recent)).toBe('just now');
    });

    it('formats minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('formats hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
    });
  });

  describe('hasConflictMarkers', () => {
    it('detects conflict markers', () => {
      const conflicted = '<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> branch';
      expect(hasConflictMarkers(conflicted)).toBe(true);
    });

    it('returns false for clean content', () => {
      expect(hasConflictMarkers('clean code here')).toBe(false);
    });
  });

  describe('extractConflicts', () => {
    it('extracts conflict regions', () => {
      const conflicted = '<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> branch';
      const conflicts = extractConflicts(conflicted);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].ours).toContain('ours');
      expect(conflicts[0].theirs).toContain('theirs');
    });
  });

  describe('generateCommitMessage', () => {
    it('generates a conventional commit message', () => {
      expect(generateCommitMessage('add', 'user authentication')).toBe(
        'feat: user authentication',
      );
      expect(generateCommitMessage('fix', 'null pointer error')).toBe(
        'fix: null pointer error',
      );
    });
  });
});
