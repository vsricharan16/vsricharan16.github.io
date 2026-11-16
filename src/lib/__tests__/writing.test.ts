import { describe, expect, it } from 'vitest';

import { validatePostFrontmatter } from '../posts';
import {
  compareWritingItems,
  getWritingItems,
  type WritingItem,
} from '../writing';

const validFrontmatter = {
  title: 'A useful title',
  date: '2026-07-25',
  description: 'A useful description.',
};

describe('getWritingItems', () => {
  it('merges published local posts and external writing newest first', () => {
    const items = getWritingItems();

    expect(items.some((item) => !item.isExternal)).toBe(true);

    const dated = items.filter((item) => item.date);
    expect(
      dated.every(
        (item, index) =>
          index === 0 || dated[index - 1]!.date.localeCompare(item.date) >= 0,
      ),
    ).toBe(true);
  });

  it('uses canonical trailing-slash URLs for local posts', () => {
    const localItems = getWritingItems().filter((item) => !item.isExternal);

    expect(localItems.length).toBeGreaterThan(0);
    expect(localItems.every((item) => item.url.endsWith('/'))).toBe(true);
    expect(localItems.every((item) => item.source === '')).toBe(true);
  });

  it('exposes a tags array on every item, defaulting to empty', () => {
    const items = getWritingItems();

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => Array.isArray(item.tags))).toBe(true);
  });

  it('orders equal and undated entries deterministically', () => {
    const item = (
      title: string,
      date: string,
      url = `https://example.com/${title.toLowerCase()}`,
    ): WritingItem => ({
      title,
      date,
      url,
      description: '',
      isExternal: true,
      source: 'Example',
      tags: [],
    });

    expect(
      [item('Zulu', ''), item('Alpha', '')].sort(compareWritingItems),
    ).toEqual([item('Alpha', ''), item('Zulu', '')]);
    expect(
      [item('Zulu', '2026-01-01'), item('Alpha', '2026-01-01')].sort(
        compareWritingItems,
      ),
    ).toEqual([item('Alpha', '2026-01-01'), item('Zulu', '2026-01-01')]);
  });
});

describe('frontmatter tags parsing', () => {
  it('omits the tags key entirely when frontmatter declares none', () => {
    const parsed = validatePostFrontmatter(validFrontmatter);

    expect(parsed).not.toHaveProperty('tags');
  });

  it('reads, trims, and lowercases a tags array', () => {
    const parsed = validatePostFrontmatter({
      ...validFrontmatter,
      tags: ['  Storage  ', 'Write-Ahead-Log'],
    });

    expect(parsed.tags).toEqual(['storage', 'write-ahead-log']);
  });

  it('rejects tags that are not an array', () => {
    expect(() =>
      validatePostFrontmatter(
        { ...validFrontmatter, tags: 'storage' },
        'content/writing/example.md',
      ),
    ).toThrow(
      'Invalid frontmatter in content/writing/example.md: "tags" must be a YAML array',
    );
  });

  it('rejects an empty tag entry', () => {
    expect(() =>
      validatePostFrontmatter(
        { ...validFrontmatter, tags: ['storage', ''] },
        'content/writing/example.md',
      ),
    ).toThrow(
      'Invalid frontmatter in content/writing/example.md: "tags[1]" must be a non-empty string',
    );
  });
});
