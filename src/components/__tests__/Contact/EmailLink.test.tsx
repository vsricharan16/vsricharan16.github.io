import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import profile from '../../../data/profile.json';
import EmailLink from '../../Contact/EmailLink';

describe('EmailLink', () => {
  it('renders the email as a static mailto link', () => {
    render(<EmailLink />);

    const link = screen.getByRole('link', { name: profile.email });
    expect(link).toHaveAttribute('href', `mailto:${profile.email}`);
    expect(link).toHaveTextContent(profile.email);
  });

  it('does not cycle through joke aliases', () => {
    render(<EmailLink />);

    expect(screen.queryByText(/hola/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/literally-anything/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: profile.email })).toHaveTextContent(
      profile.email,
    );
  });
});
