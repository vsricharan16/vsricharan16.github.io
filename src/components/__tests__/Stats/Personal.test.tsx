import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Personal from '../../Stats/Personal';

describe('Personal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the personal stats table', () => {
    render(<Personal />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('does not display current age', () => {
    render(<Personal />);

    expect(screen.queryByText('Current age')).not.toBeInTheDocument();
  });

  it('displays current city', () => {
    render(<Personal />);

    expect(screen.getByText('Current city')).toBeInTheDocument();
    expect(screen.getByText('Mountain View, CA')).toBeInTheDocument();
  });

  it('does not tick age on the stats page', () => {
    render(<Personal />);

    expect(screen.queryByText('Current age')).not.toBeInTheDocument();
    expect(document.querySelector('.stat-live')).not.toBeInTheDocument();
  });
});
