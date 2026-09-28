import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Footer from '../../Template/Footer';

describe('Footer', () => {
  it('renders the footer with correct structure', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('displays the name and role', () => {
    render(<Footer />);

    expect(screen.getByText('V Sri Charan Reddy')).toBeInTheDocument();
    expect(
      screen.getByText('Member of Technical Staff, Nutanix'),
    ).toBeInTheDocument();
  });

  it('does not introduce unrelated headings into the page outline', () => {
    render(<Footer />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('displays the current year in copyright', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`© ${currentYear}`)),
    ).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute(
      'href',
      '/about',
    );
    expect(screen.getByRole('link', { name: /resume/i })).toHaveAttribute(
      'href',
      '/resume',
    );
    expect(screen.getByRole('link', { name: /writing/i })).toHaveAttribute(
      'href',
      '/writing',
    );
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(
      screen.queryByRole('link', { name: /stats/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /archive/i }),
    ).not.toBeInTheDocument();
  });

  it('renders contact icons section', () => {
    render(<Footer />);

    // Contact icons are rendered via ContactIcons component
    const socialSection = document.querySelector('.footer-social');
    expect(socialSection).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('has link to home from avatar', () => {
    render(<Footer />);

    const avatarLink = document.querySelector('.footer-avatar');
    expect(avatarLink).toHaveAttribute('href', '/');
  });

  it('does not link to the source repository', () => {
    render(<Footer />);

    expect(
      screen.queryByRole('link', { name: /source/i }),
    ).not.toBeInTheDocument();
  });
});
