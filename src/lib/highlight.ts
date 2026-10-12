export type HighlightTokenKind =
  | 'text'
  | 'keyword'
  | 'type'
  | 'string'
  | 'comment'
  | 'number';

export interface HighlightToken {
  kind: HighlightTokenKind;
  value: string;
}

const CPP_KEYWORDS = new Set([
  'alignas',
  'alignof',
  'and',
  'auto',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'consteval',
  'constexpr',
  'continue',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'explicit',
  'export',
  'extern',
  'false',
  'for',
  'friend',
  'goto',
  'if',
  'inline',
  'namespace',
  'new',
  'noexcept',
  'not',
  'nullptr',
  'operator',
  'or',
  'private',
  'protected',
  'public',
  'return',
  'sizeof',
  'static',
  'struct',
  'switch',
  'template',
  'this',
  'throw',
  'true',
  'try',
  'typedef',
  'typename',
  'using',
  'virtual',
  'volatile',
  'while',
]);

const CPP_TYPES = new Set([
  'bool',
  'char',
  'double',
  'float',
  'int',
  'long',
  'short',
  'size_t',
  'uint32_t',
  'uint64_t',
  'unsigned',
  'void',
  'atomic',
  'condition_variable',
  'lock_guard',
  'scoped_lock',
  'shared_lock',
  'shared_mutex',
  'unique_lock',
  'thread',
]);

const PYTHON_KEYWORDS = new Set([
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'False',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'None',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'True',
  'try',
  'while',
  'with',
  'yield',
]);

const JAVA_KEYWORDS = new Set([
  'abstract',
  'assert',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'else',
  'enum',
  'extends',
  'false',
  'final',
  'finally',
  'for',
  'goto',
  'if',
  'implements',
  'import',
  'instanceof',
  'interface',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'strictfp',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'void',
  'volatile',
  'while',
]);

const JAVA_TYPES = new Set([
  'AtomicBoolean',
  'AtomicInteger',
  'boolean',
  'Boolean',
  'byte',
  'char',
  'double',
  'float',
  'int',
  'Integer',
  'long',
  'Lock',
  'ReadWriteLock',
  'ReentrantReadWriteLock',
  'short',
  'String',
  'Thread',
]);

function isIdentifierStart(char: string): boolean {
  return /[A-Za-z_]/.test(char);
}

function isIdentifierPart(char: string): boolean {
  return /[A-Za-z0-9_]/.test(char);
}

function readWhile(
  source: string,
  start: number,
  predicate: (char: string) => boolean,
): number {
  let index = start;
  while (index < source.length && predicate(source[index])) {
    index += 1;
  }
  return index;
}

function push(
  tokens: HighlightToken[],
  kind: HighlightTokenKind,
  value: string,
): void {
  if (value === '') {
    return;
  }
  const last = tokens[tokens.length - 1];
  if (last && last.kind === kind) {
    last.value += value;
    return;
  }
  tokens.push({ kind, value });
}

function tokenizeCppLike(
  source: string,
  keywords: Set<string>,
  types: Set<string>,
  hashComments: boolean,
): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '/' && next === '/') {
      const end = source.indexOf('\n', index);
      const stop = end === -1 ? source.length : end;
      push(tokens, 'comment', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (char === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      const stop = end === -1 ? source.length : end + 2;
      push(tokens, 'comment', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (hashComments && char === '#') {
      const end = source.indexOf('\n', index);
      const stop = end === -1 ? source.length : end;
      push(tokens, 'comment', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (char === '#' && !hashComments) {
      const end = source.indexOf('\n', index);
      const stop = end === -1 ? source.length : end;
      push(tokens, 'keyword', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (char === '"' || char === "'") {
      let cursor = index + 1;
      while (cursor < source.length) {
        if (source[cursor] === '\\') {
          cursor += 2;
          continue;
        }
        if (source[cursor] === char) {
          cursor += 1;
          break;
        }
        cursor += 1;
      }
      push(tokens, 'string', source.slice(index, cursor));
      index = cursor;
      continue;
    }

    if (/\d/.test(char)) {
      const stop = readWhile(source, index, (value) => /[\d.]/.test(value));
      push(tokens, 'number', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (isIdentifierStart(char)) {
      const stop = readWhile(source, index, isIdentifierPart);
      const word = source.slice(index, stop);
      if (keywords.has(word)) {
        push(tokens, 'keyword', word);
      } else if (types.has(word) || /^[A-Z]/.test(word)) {
        push(tokens, 'type', word);
      } else {
        push(tokens, 'text', word);
      }
      index = stop;
      continue;
    }

    const stop = readWhile(
      source,
      index,
      (value) =>
        !isIdentifierStart(value) &&
        !/\d/.test(value) &&
        value !== '"' &&
        value !== "'" &&
        value !== '#' &&
        value !== '/',
    );
    const sliceEnd = stop === index ? index + 1 : stop;
    push(tokens, 'text', source.slice(index, sliceEnd));
    index = sliceEnd;
  }

  return tokens;
}

export function highlightCode(
  source: string,
  language: string,
): HighlightToken[] {
  if (language === 'python') {
    return tokenizeCppLike(source, PYTHON_KEYWORDS, new Set(), true);
  }
  if (language === 'java') {
    return tokenizeCppLike(source, JAVA_KEYWORDS, JAVA_TYPES, false);
  }
  if (language === 'cpp' || language === 'c') {
    return tokenizeCppLike(source, CPP_KEYWORDS, CPP_TYPES, false);
  }
  return source.length === 0 ? [] : [{ kind: 'text', value: source }];
}
