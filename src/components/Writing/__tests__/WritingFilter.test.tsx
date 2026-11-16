import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { WritingItem } from '@/lib/writing';
import WritingFilter from '../WritingFilter';

function post(
  title: string,
  tags: string[],
  description = `About ${title}`,
): WritingItem {
  return {
    title,
    url: `/writing/${title.toLowerCase().replace(/\s+/g, '-')}/`,
    date: '2026-01-01',
    description,
    isExternal: false,
    source: '',
    tags,
  };
}

const POSTS: WritingItem[] = [
  post('Write-Ahead Log', ['storage', 'databases']),
  post('Bloom Filters', ['databases']),
  post('Epoll', ['networking']),
];

function titles(): string[] {
  return screen
    .getAllByRole('heading', { level: 3 })
    .map((node) => node.textContent ?? '');
}

describe('WritingFilter', () => {
  it('renders every post and a chip per unique tag by default', () => {
    render(<WritingFilter posts={POSTS} />);

    expect(titles()).toEqual(['Write-Ahead Log', 'Bloom Filters', 'Epoll']);

    const group = screen.getByRole('group', { name: 'Filter by tag' });
    const chips = within(group).getAllByRole('button');
    expect(chips.map((chip) => chip.textContent)).toEqual([
      'databases',
      'networking',
      'storage',
    ]);
    expect(
      chips.every((chip) => chip.getAttribute('aria-pressed') === 'false'),
    ).toBe(true);
  });

  it('filters by free text across title, description, and tags', () => {
    render(<WritingFilter posts={POSTS} />);

    fireEvent.change(screen.getByLabelText('Search writing'), {
      target: { value: 'networking' },
    });

    expect(titles()).toEqual(['Epoll']);
    expect(screen.getByRole('status')).toHaveTextContent('1 of 3 posts');
  });

  it('toggles a tag chip and reflects it with aria-pressed', () => {
    render(<WritingFilter posts={POSTS} />);

    const storage = screen.getByRole('button', { name: 'storage' });
    fireEvent.click(storage);

    expect(storage).toHaveAttribute('aria-pressed', 'true');
    expect(titles()).toEqual(['Write-Ahead Log']);

    fireEvent.click(storage);
    expect(storage).toHaveAttribute('aria-pressed', 'false');
    expect(titles()).toHaveLength(3);
  });

  it('combines multiple tags with OR', () => {
    render(<WritingFilter posts={POSTS} />);

    fireEvent.click(screen.getByRole('button', { name: 'storage' }));
    fireEvent.click(screen.getByRole('button', { name: 'networking' }));

    expect(titles()).toEqual(['Write-Ahead Log', 'Epoll']);
  });

  it('combines text search with tag filters', () => {
    render(<WritingFilter posts={POSTS} />);

    fireEvent.click(screen.getByRole('button', { name: 'databases' }));
    fireEvent.change(screen.getByLabelText('Search writing'), {
      target: { value: 'bloom' },
    });

    expect(titles()).toEqual(['Bloom Filters']);
  });

  it('shows an empty state and a working clear affordance', () => {
    render(<WritingFilter posts={POSTS} />);

    fireEvent.change(screen.getByLabelText('Search writing'), {
      target: { value: 'nonexistent-topic' },
    });

    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    expect(screen.getByText(/no posts match your search/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(titles()).toHaveLength(3);
    expect(
      (screen.getByLabelText('Search writing') as HTMLInputElement).value,
    ).toBe('');
  });

  it('renders no chips when no post carries a tag', () => {
    render(
      <WritingFilter
        posts={[post('Untagged', []), post('Also Untagged', [])]}
      />,
    );

    expect(
      screen.queryByRole('group', { name: 'Filter by tag' }),
    ).not.toBeInTheDocument();
  });
});
