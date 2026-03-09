import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation
const mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock LanguageSwitcher
jest.mock('@/app/components/LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <div data-testid="language-switcher">Lang</div>;
  };
});

import Header from '@/app/components/Header';

describe('Header', () => {
  it('renders logo and brand name', () => {
    render(<Header />);
    expect(screen.getByText('ScoreMyPrompt')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Guide')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('renders hamburger button for mobile', () => {
    render(<Header />);
    const btn = screen.getByLabelText('Open menu');
    expect(btn).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger is clicked', () => {
    render(<Header />);
    const btn = screen.getByLabelText('Open menu');
    fireEvent.click(btn);

    // Should now show mobile nav
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument();
    // Close button should appear
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('closes mobile menu when hamburger is clicked again', () => {
    render(<Header />);
    const btn = screen.getByLabelText('Open menu');
    fireEvent.click(btn); // open
    fireEvent.click(screen.getByLabelText('Close menu')); // close

    expect(screen.queryByLabelText('Mobile navigation')).not.toBeInTheDocument();
  });

  it('includes language switcher', () => {
    render(<Header />);
    expect(screen.getAllByTestId('language-switcher').length).toBeGreaterThan(0);
  });
});
