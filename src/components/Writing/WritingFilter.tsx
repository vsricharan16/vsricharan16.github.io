'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';

import { formatDate } from '@/lib/utils';
import type { WritingItem } from '@/lib/writing';

interface WritingFilterProps {
  posts: WritingItem[];
}

function matchesText(post: WritingItem, query: string): boolean {
  const haystack = [post.title, post.description, ...post.tags]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

/**
 * Client-side search and tag filter for the on-site posts. Purely local
 * filtering over props so it stays compatible with `output: 'export'` — no
 * server actions, no data fetching.
 *
 * Tags combine with OR (a post matches if it carries any active tag), which is
 * the friendlier default: adding a tag widens the result set rather than
 * narrowing it toward the empty intersection. Text search combines with the
 * tag set using AND.
 */
export default function WritingFilter({ posts }: WritingFilterProps) {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const searchId = useId();

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags) {
        seen.add(tag);
      }
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      posts.filter((post) => {
        const textOk =
          normalizedQuery === '' || matchesText(post, normalizedQuery);
        const tagOk =
          activeTags.length === 0 ||
          activeTags.some((tag) => post.tags.includes(tag));
        return textOk && tagOk;
      }),
    [posts, normalizedQuery, activeTags],
  );

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((entry) => entry !== tag)
        : [...current, tag],
    );
  };

  const clearFilters = () => {
    setQuery('');
    setActiveTags([]);
  };

  const hasFilters = normalizedQuery !== '' || activeTags.length > 0;
  const noun = posts.length === 1 ? 'post' : 'posts';
  const countLabel =
    filtered.length === posts.length
      ? `${posts.length} ${noun}`
      : `${filtered.length} of ${posts.length} ${noun}`;

  return (
    <div className="writing-filter">
      <div className="writing-search">
        <label className="sr-only" htmlFor={searchId}>
          Search writing
        </label>
        <input
          id={searchId}
          type="search"
          className="writing-search-input"
          placeholder="Search writing…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {allTags.length > 0 && (
        <div className="writing-tags" role="group" aria-label="Filter by tag">
          {allTags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className="writing-tag"
                aria-pressed={active}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      <div className="writing-status">
        <p className="writing-result-count" role="status" aria-live="polite">
          {countLabel}
        </p>
        {hasFilters && (
          <button
            type="button"
            className="writing-filter-clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="writing-list">
          {filtered.map((post) => (
            <Link key={post.url} href={post.url} className="writing-item">
              <div className="writing-meta">
                {post.date && (
                  <time className="writing-date" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                )}
              </div>
              <h3 className="writing-title">{post.title}</h3>
              <p className="writing-description">{post.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="writing-empty">
          No posts match your search. Try a different term or clear the filters.
        </p>
      )}
    </div>
  );
}
