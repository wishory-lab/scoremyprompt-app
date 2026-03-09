import { render, screen, fireEvent, act } from '@testing-library/react';

// Mock PostHog
jest.mock('posthog-js', () => ({
  opt_in_capturing: jest.fn(),
  opt_out_capturing: jest.fn(),
}));

// Must import after mock
import CookieConsent, { useCookieConsent } from '@/app/components/CookieConsent';

function TestConsumer() {
  const { consent, hasConsented, isAnalyticsAllowed } = useCookieConsent();
  return (
    <div>
      <span data-testid="consent">{consent?.choice || 'none'}</span>
      <span data-testid="consented">{String(hasConsented)}</span>
      <span data-testid="analytics">{String(isAnalyticsAllowed)}</span>
    </div>
  );
}

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not show banner if consent was already given', () => {
    localStorage.setItem(
      'smp-cookie-consent',
      JSON.stringify({ choice: 'all', timestamp: Date.now(), version: 1 })
    );
    render(<CookieConsent />);
    act(() => { jest.advanceTimersByTime(2000); });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows banner after delay when no consent exists', () => {
    render(<CookieConsent />);
    // Should not be visible immediately
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Advance past the delay
    act(() => { jest.advanceTimersByTime(2000); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('stores "all" consent on Accept All click', () => {
    render(<CookieConsent />);
    act(() => { jest.advanceTimersByTime(2000); });

    fireEvent.click(screen.getByText('Accept All'));

    const stored = JSON.parse(localStorage.getItem('smp-cookie-consent') || '{}');
    expect(stored.choice).toBe('all');
    expect(stored.version).toBe(1);
  });

  it('stores "essential" consent on Essential Only click', () => {
    render(<CookieConsent />);
    act(() => { jest.advanceTimersByTime(2000); });

    fireEvent.click(screen.getByText('Essential Only'));

    const stored = JSON.parse(localStorage.getItem('smp-cookie-consent') || '{}');
    expect(stored.choice).toBe('essential');
  });

  it('hides banner after accepting', () => {
    render(<CookieConsent />);
    act(() => { jest.advanceTimersByTime(2000); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Accept All'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has accessible role and labels', () => {
    render(<CookieConsent />);
    act(() => { jest.advanceTimersByTime(2000); });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Cookie consent');
    expect(dialog).toHaveAttribute('aria-describedby');
  });
});

describe('useCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns hasConsented false when no consent stored', () => {
    render(<TestConsumer />);
    expect(screen.getByTestId('consented')).toHaveTextContent('false');
    expect(screen.getByTestId('analytics')).toHaveTextContent('false');
  });

  it('returns isAnalyticsAllowed true for "all" consent', () => {
    localStorage.setItem(
      'smp-cookie-consent',
      JSON.stringify({ choice: 'all', timestamp: Date.now(), version: 1 })
    );
    render(<TestConsumer />);
    expect(screen.getByTestId('consented')).toHaveTextContent('true');
    expect(screen.getByTestId('analytics')).toHaveTextContent('true');
  });

  it('returns isAnalyticsAllowed false for "essential" consent', () => {
    localStorage.setItem(
      'smp-cookie-consent',
      JSON.stringify({ choice: 'essential', timestamp: Date.now(), version: 1 })
    );
    render(<TestConsumer />);
    expect(screen.getByTestId('analytics')).toHaveTextContent('false');
  });
});
