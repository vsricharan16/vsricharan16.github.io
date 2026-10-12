import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getWritingItems } from '@/lib/writing';
import HomePage from '../page';
import WritingPage from '../writing/page';

describe('writing information architecture', () => {
  it('surfaces recent writing on the homepage', () => {
    const newest = getWritingItems().find((item) => item.date);
    const { container } = render(<HomePage />);

    expect(
      screen.getByRole('region', { name: 'Latest writing' }),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('.home-writing-item').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { name: newest?.title ?? '' }),
    ).toBeInTheDocument();
  });

  it('groups owned essays, external articles, and guides under real headings', () => {
    const { container } = render(<WritingPage />);

    expect(
      screen.queryByRole('heading', { level: 2, name: 'Essays on this site' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('On this site')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        level: 2,
        name: 'Selected writing elsewhere',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 2, name: 'Guides' }),
    ).not.toBeInTheDocument();

    expect(container.querySelectorAll('.writing-item h3')).toHaveLength(
      getWritingItems().length,
    );
  });

  it('lists every essay at the same title size', () => {
    const { container } = render(<WritingPage />);

    expect(container.querySelector('.writing-item--featured')).toBeNull();
    expect(container.querySelectorAll('.writing-title').length).toBe(
      getWritingItems().length,
    );
  });

  it('shows provenance beside every external-link arrow', () => {
    const externalItems = getWritingItems().filter((item) => item.isExternal);
    const { container } = render(<WritingPage />);
    const externalLinks = [
      ...container.querySelectorAll('a.writing-item[target="_blank"]'),
    ];

    expect(externalLinks).toHaveLength(externalItems.length);
    externalLinks.forEach((link, index) => {
      expect(link.querySelector('.writing-source')).toHaveTextContent(
        externalItems[index].source,
      );
      expect(link.querySelector('.writing-external')).toHaveTextContent('↗');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link.querySelector('.sr-only')).toHaveTextContent(
        'opens in a new tab',
      );
    });
  });
});
