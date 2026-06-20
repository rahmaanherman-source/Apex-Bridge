/**
 * Syntax Tokenizer
 *
 * A lightweight, mobile-optimized tokenizer for syntax highlighting.
 * Uses earth-tone colors — terracotta, sage, amber, mist — that whisper,
 * not shout. Guides the eye through logic without demanding attention.
 *
 * Supported languages: TypeScript, JavaScript, Python, JSON, CSS, Markdown
 */

import { BreezeColors } from '../theme/colors';

export type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'variable'
  | 'type'
  | 'operator'
  | 'decorator'
  | 'default';

export interface Token {
  type: TokenType;
  value: string;
  color: string;
}

/** Maps token types to Breeze earth-tone colors */
const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: BreezeColors.syntaxKeyword,
  string: BreezeColors.syntaxString,
  number: BreezeColors.syntaxNumber,
  comment: BreezeColors.syntaxComment,
  function: BreezeColors.syntaxFunction,
  variable: BreezeColors.syntaxVariable,
  type: BreezeColors.syntaxType,
  operator: BreezeColors.syntaxOperator,
  decorator: BreezeColors.syntaxDecorator,
  default: BreezeColors.syntaxDefault,
};

// ── Language Keyword Sets ────────────────────────────────────────────────────

const TS_KEYWORDS = new Set([
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class',
  'const', 'continue', 'debugger', 'declare', 'default', 'delete', 'do',
  'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from',
  'function', 'if', 'implements', 'import', 'in', 'infer', 'instanceof',
  'interface', 'keyof', 'let', 'module', 'namespace', 'never', 'new',
  'null', 'of', 'override', 'package', 'private', 'protected', 'public',
  'readonly', 'return', 'static', 'super', 'switch', 'this', 'throw',
  'true', 'try', 'type', 'typeof', 'undefined', 'var', 'void', 'while',
  'with', 'yield',
]);

const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
  'while', 'with', 'yield',
]);

const TS_TYPES = new Set([
  'string', 'number', 'boolean', 'object', 'any', 'unknown', 'never',
  'void', 'null', 'undefined', 'symbol', 'bigint', 'Array', 'Promise',
  'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit',
  'Exclude', 'Extract', 'NonNullable', 'ReturnType', 'InstanceType',
]);

// ── Tokenizer ────────────────────────────────────────────────────────────────

/** Creates a token with its corresponding color */
function makeToken(type: TokenType, value: string): Token {
  return { type, value, color: TOKEN_COLORS[type] };
}

/** Tokenizes a single line of TypeScript/JavaScript */
function tokenizeLineTS(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Single-line comment
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push(makeToken('comment', line.slice(i)));
      break;
    }

    // Decorator
    if (line[i] === '@') {
      let j = i + 1;
      while (j < line.length && /\w/.test(line[j])) j++;
      tokens.push(makeToken('decorator', line.slice(i, j)));
      i = j;
      continue;
    }

    // String — single quote
    if (line[i] === "'") {
      let j = i + 1;
      while (j < line.length && (line[j] !== "'" || line[j - 1] === '\\')) j++;
      tokens.push(makeToken('string', line.slice(i, j + 1)));
      i = j + 1;
      continue;
    }

    // String — double quote
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && (line[j] !== '"' || line[j - 1] === '\\')) j++;
      tokens.push(makeToken('string', line.slice(i, j + 1)));
      i = j + 1;
      continue;
    }

    // Template literal
    if (line[i] === '`') {
      let j = i + 1;
      while (j < line.length && (line[j] !== '`' || line[j - 1] === '\\')) j++;
      tokens.push(makeToken('string', line.slice(i, j + 1)));
      i = j + 1;
      continue;
    }

    // Number
    if (/\d/.test(line[i]) || (line[i] === '.' && /\d/.test(line[i + 1] ?? ''))) {
      let j = i;
      while (j < line.length && /[\d._xXbBoO]/.test(line[j])) j++;
      tokens.push(makeToken('number', line.slice(i, j)));
      i = j;
      continue;
    }

    // Identifier (keyword, type, function, or variable)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const isFunction = line[j] === '(' || (line[j] === ' ' && line[j + 1] === '(');

      let tokenType: TokenType = 'default';
      if (TS_KEYWORDS.has(word)) {
        tokenType = 'keyword';
      } else if (TS_TYPES.has(word)) {
        tokenType = 'type';
      } else if (isFunction) {
        tokenType = 'function';
      } else if (/^[A-Z]/.test(word)) {
        tokenType = 'type';
      }

      tokens.push(makeToken(tokenType, word));
      i = j;
      continue;
    }

    // Operator
    if (/[+\-*/%=<>!&|^~?:]/.test(line[i])) {
      let j = i;
      // Consume multi-character operators
      while (j < line.length && /[+\-*/%=<>!&|^~?:]/.test(line[j])) j++;
      tokens.push(makeToken('operator', line.slice(i, j)));
      i = j;
      continue;
    }

    // Everything else — punctuation, whitespace
    tokens.push(makeToken('default', line[i]));
    i++;
  }

  return tokens;
}

/** Tokenizes a single line of Python */
function tokenizeLinePython(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === '#') {
      tokens.push(makeToken('comment', line.slice(i)));
      break;
    }
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) j++;
      tokens.push(makeToken('string', line.slice(i, j + 1)));
      i = j + 1;
      continue;
    }
    if (/\d/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d.eE_]/.test(line[j])) j++;
      tokens.push(makeToken('number', line.slice(i, j)));
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /\w/.test(line[j])) j++;
      const word = line.slice(i, j);
      tokens.push(makeToken(PYTHON_KEYWORDS.has(word) ? 'keyword' : 'default', word));
      i = j;
      continue;
    }
    tokens.push(makeToken('default', line[i]));
    i++;
  }

  return tokens;
}

export type SupportedLanguage = 'typescript' | 'javascript' | 'python' | 'json' | 'css' | 'markdown' | 'text';

/**
 * Tokenizes an entire source string into lines of tokens.
 *
 * @param source - The source code string
 * @param language - The programming language
 * @returns Array of token arrays, one per line
 */
export function tokenize(source: string, language: SupportedLanguage): Token[][] {
  const lines = source.split('\n');

  return lines.map((line) => {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return tokenizeLineTS(line);
      case 'python':
        return tokenizeLinePython(line);
      case 'json':
        return tokenizeLineJSON(line);
      default:
        return [makeToken('default', line)];
    }
  });
}

/** Simple JSON tokenizer */
function tokenizeLineJSON(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && (line[j] !== '"' || line[j - 1] === '\\')) j++;
      const str = line.slice(i, j + 1);
      // JSON keys (followed by colon) are variables, values are strings
      const isKey = line.slice(j + 1).trimStart().startsWith(':');
      tokens.push(makeToken(isKey ? 'variable' : 'string', str));
      i = j + 1;
      continue;
    }
    if (/\d/.test(line[i]) || (line[i] === '-' && /\d/.test(line[i + 1] ?? ''))) {
      let j = i;
      while (j < line.length && /[\d.\-eE+]/.test(line[j])) j++;
      tokens.push(makeToken('number', line.slice(i, j)));
      i = j;
      continue;
    }
    if (line.slice(i, i + 4) === 'true' || line.slice(i, i + 5) === 'false' || line.slice(i, i + 4) === 'null') {
      const len = line[i] === 'n' ? 4 : line[i] === 't' ? 4 : 5;
      tokens.push(makeToken('keyword', line.slice(i, i + len)));
      i += len;
      continue;
    }
    tokens.push(makeToken('default', line[i]));
    i++;
  }

  return tokens;
}

/**
 * Infers language from file extension.
 */
export function inferLanguage(filename: string): SupportedLanguage {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, SupportedLanguage> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    py: 'python',
    json: 'json',
    css: 'css',
    scss: 'css',
    md: 'markdown',
    mdx: 'markdown',
  };
  return map[ext] ?? 'text';
}
