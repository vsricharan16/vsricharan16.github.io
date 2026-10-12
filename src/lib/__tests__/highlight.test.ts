import { describe, expect, it } from 'vitest';

import { highlightCode } from '../highlight';

describe('highlightCode', () => {
  it('marks C++ keywords, types, comments, and strings', () => {
    const tokens = highlightCode(
      '// wait\nbool locked = false;\n"held"',
      'cpp',
    );
    const byKind = Object.fromEntries(
      tokens
        .filter((token) => token.kind !== 'text')
        .map((token) => [token.kind, token.value]),
    );

    expect(
      tokens.some(
        (token) => token.kind === 'comment' && token.value.includes('wait'),
      ),
    ).toBe(true);
    expect(byKind.keyword).toContain('false');
    expect(byKind.type).toContain('bool');
    expect(byKind.string).toBe('"held"');
  });

  it('highlights C with the same keyword rules as C++', () => {
    const tokens = highlightCode('struct inode *inode;', 'c');

    expect(
      tokens.some(
        (token) => token.kind === 'keyword' && token.value === 'struct',
      ),
    ).toBe(true);
  });

  it('treats Python hashes as comments and def as a keyword', () => {
    const tokens = highlightCode('# spin\ndef lock():\n    pass', 'python');

    expect(
      tokens.some(
        (token) => token.kind === 'comment' && token.value.startsWith('#'),
      ),
    ).toBe(true);
    expect(
      tokens.some((token) => token.kind === 'keyword' && token.value === 'def'),
    ).toBe(true);
  });

  it('leaves unknown languages as a single text token', () => {
    expect(highlightCode('plain', 'bash')).toEqual([
      { kind: 'text', value: 'plain' },
    ]);
  });
});
