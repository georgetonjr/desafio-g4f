import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from './page';

vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe('Home', () => {
  it('renders the getting started heading', () => {
    render(<Home />);

    expect(screen.getByText(/To get started, edit the/i)).toBeInTheDocument();
  });

  it('renders the documentation link', () => {
    render(<Home />);

    const link = screen.getByRole('link', { name: /documentation/i });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('nextjs.org/docs'),
    );
  });
});
