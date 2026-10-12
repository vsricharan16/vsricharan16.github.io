import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Education from '../../Resume/Education';
import Degree from '../../Resume/Education/Degree';

const mockDegrees = [
  {
    school: 'Stanford University',
    degree: 'M.S. Computer Science',
    link: 'https://stanford.edu',
    year: 2020,
  },
  {
    school: 'MIT',
    degree: 'B.S. Computer Science',
    link: 'https://mit.edu',
    year: 2016,
  },
];

describe('Education', () => {
  it('renders the education section with title', () => {
    render(<Education data={mockDegrees} />);

    expect(
      screen.getByRole('heading', { name: /education/i }),
    ).toBeInTheDocument();
  });

  it('renders all degrees', () => {
    render(<Education data={mockDegrees} />);

    expect(screen.getByText('M.S. Computer Science')).toBeInTheDocument();
    expect(screen.getByText('B.S. Computer Science')).toBeInTheDocument();
  });

  it('renders school links', () => {
    render(<Education data={mockDegrees} />);

    const stanfordLink = screen.getByRole('link', { name: /stanford/i });
    expect(stanfordLink).toHaveAttribute('href', 'https://stanford.edu');

    const mitLink = screen.getByRole('link', { name: /mit/i });
    expect(mitLink).toHaveAttribute('href', 'https://mit.edu');
  });
});

describe('Degree', () => {
  const mockDegree = {
    school: 'Stanford University',
    degree: 'M.S. Computer Science',
    link: 'https://stanford.edu',
    year: 2020,
  };

  it('renders the school as the heading', () => {
    render(<Degree data={mockDegree} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Stanford University',
    );
  });

  it('renders the degree name beneath the school', () => {
    render(<Degree data={mockDegree} />);

    expect(screen.getByText('M.S. Computer Science')).toBeInTheDocument();
  });

  it('renders a minor on its own line when provided', () => {
    render(<Degree data={{ ...mockDegree, minor: 'Minor in Design' }} />);

    expect(screen.getByText('Minor in Design')).toBeInTheDocument();
  });

  it('renders school name with link', () => {
    render(<Degree data={mockDegree} />);

    const link = screen.getByRole('link', { name: /stanford/i });
    expect(link).toHaveAttribute('href', 'https://stanford.edu');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('does not display the graduation year', () => {
    render(<Degree data={mockDegree} />);

    expect(screen.queryByText(/2020/)).not.toBeInTheDocument();
  });

  it('renders as article element', () => {
    render(<Degree data={mockDegree} />);

    const article = document.querySelector('article.degree-container');
    expect(article).toBeInTheDocument();
  });
});
