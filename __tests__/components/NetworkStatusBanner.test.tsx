import { render, screen, act } from '@testing-library/react';

// Mock the useNetworkStatus hook
let mockIsOnline = true;
jest.mock('@/app/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline }),
}));

import NetworkStatusBanner from '@/app/components/NetworkStatusBanner';

describe('NetworkStatusBanner', () => {
  beforeEach(() => {
    mockIsOnline = true;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when online', () => {
    const { container } = render(<NetworkStatusBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('shows offline banner when network goes down', () => {
    mockIsOnline = false;
    const { rerender } = render(<NetworkStatusBanner />);

    // Force re-render with offline state
    rerender(<NetworkStatusBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  it('shows reconnected message when coming back online', () => {
    // Start offline
    mockIsOnline = false;
    const { rerender } = render(<NetworkStatusBanner />);
    rerender(<NetworkStatusBanner />);

    // Go back online
    mockIsOnline = true;
    rerender(<NetworkStatusBanner />);

    expect(screen.getByText(/back online/i)).toBeInTheDocument();
  });

  it('auto-hides reconnected message after 3 seconds', () => {
    mockIsOnline = false;
    const { rerender } = render(<NetworkStatusBanner />);
    rerender(<NetworkStatusBanner />);

    mockIsOnline = true;
    rerender(<NetworkStatusBanner />);
    expect(screen.getByText(/back online/i)).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(3500); });
    expect(screen.queryByText(/back online/i)).not.toBeInTheDocument();
  });

  it('has accessible alert role', () => {
    mockIsOnline = false;
    const { rerender } = render(<NetworkStatusBanner />);
    rerender(<NetworkStatusBanner />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
