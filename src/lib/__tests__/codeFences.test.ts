import { describe, expect, it } from 'vitest';
import { splitPostContent } from '../codeFences';
import { getAllPosts } from '../posts';

describe('splitPostContent', () => {
  it('passes through markdown that has no fences', () => {
    expect(splitPostContent('A paragraph.')).toEqual([
      { type: 'markdown', text: 'A paragraph.' },
    ]);
  });

  it('groups consecutive C++, Python, and Java fences into one tab set', () => {
    const markdown = [
      'Before.',
      '',
      '```cpp',
      'int x = 1;',
      '```',
      '',
      '```python',
      'x = 1',
      '```',
      '',
      '```java',
      'int x = 1;',
      '```',
      '',
      'After.',
    ].join('\n');

    const segments = splitPostContent(markdown);

    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ type: 'markdown', text: 'Before.\n\n' });
    expect(segments[1]).toMatchObject({ type: 'tabs' });
    if (segments[1].type !== 'tabs') {
      throw new Error('expected tabs');
    }
    expect(segments[1].panes.map((pane) => pane.language)).toEqual([
      'cpp',
      'python',
      'java',
    ]);
    expect(segments[1].panes[0]?.code).toBe('int x = 1;');
    expect(segments[2]).toEqual({ type: 'markdown', text: '\n\nAfter.' });
  });

  it('does not group two C++ samples in a row', () => {
    const markdown = ['```cpp', 'a', '```', '', '```cpp', 'b', '```'].join(
      '\n',
    );
    const segments = splitPostContent(markdown);

    expect(segments.some((segment) => segment.type === 'tabs')).toBe(false);
    expect(
      segments
        .filter((segment) => segment.type === 'code')
        .map((segment) => {
          if (segment.type !== 'code') {
            throw new Error('expected code');
          }
          return segment.code;
        }),
    ).toEqual(['a', 'b']);
  });

  it('keeps a lone fence as a highlighted block', () => {
    const segments = splitPostContent('```cpp\nint x;\n```');

    expect(segments).toEqual([
      { type: 'code', language: 'cpp', code: 'int x;' },
    ]);
  });

  it('turns language triples in published posts into tab sets', () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      const tabSets = splitPostContent(post.content).filter(
        (segment) => segment.type === 'tabs',
      );

      // A C++-only post is a sequence of single fences. A post that starts
      // the Python/Java switcher has to finish it.
      if (post.content.includes('```python')) {
        expect(tabSets.length, post.slug).toBeGreaterThan(0);
      }
      for (const segment of tabSets) {
        if (segment.type !== 'tabs') {
          continue;
        }
        expect(segment.panes.map((pane) => pane.language)).toEqual([
          'cpp',
          'python',
          'java',
        ]);
      }
    }
  });
});
