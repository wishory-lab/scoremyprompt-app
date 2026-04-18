/**
 * Component Tests: Toast (ToastProvider + useToast)
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/app/components/Toast';

// Helper component to trigger toasts
function ToastTrigger({ type = 'info', message = 'Test message' }: { type?: 'info' | 'success' | 'error' | 'warning'; message?: string }) {
  const { showToast, removeToast } = useToast();
  return (
    <>
      <button onClick={() => showToast(message, type)}>
        Show Toast
      </button>
      <button onClick={() => removeToast(Date.now())}>
        Remove Toast
      </button>
    </>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders toast when showToast is called', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders toast with role="alert"', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders success toast with correct styling', () => {
    renderWithProvider(<ToastTrigger type="success" />);
    fireEvent.click(screen.getByText('Show Toast'));
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-green-600');
  });

  it('renders error toast with correct styling', () => {
    renderWithProvider(<ToastTrigger type="error" />);
    fireEvent.click(screen.getByText('Show Toast'));
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-red-600');
  });

  it('renders warning toast with correct styling', () => {
    renderWithProvider(<ToastTrigger type="warning" />);
    fireEvent.click(screen.getByText('Show Toast'));
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-amber-600');
  });

  it('renders info toast with correct styling', () => {
    renderWithProvider(<ToastTrigger type="info" />);
    fireEvent.click(screen.getByText('Show Toast'));
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-blue-600');
  });

  it('auto-dismisses toast after duration', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Advance past auto-dismiss (default 3000ms + 300ms exit animation)
    act(() => { jest.advanceTimersByTime(3300); });
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('has close button with accessible label', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByLabelText('Close notification')).toBeInTheDocument();
  });

  it('removes toast when close button is clicked', () => {
    renderWithProvider(<ToastTrigger />);
    fireEvent.click(screen.getByText('Show Toast'));
    fireEvent.click(screen.getByLabelText('Close notification'));

    // Advance past exit animation
    act(() => { jest.advanceTimersByTime(300); });
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('has aria-live polite container', () => {
    renderWithProvider(<ToastTrigger />);
    const container = document.querySelector('[aria-live="polite"]');
    expect(container).toBeInTheDocument();
  });

  it('keeps only last 3 toasts', () => {
    function MultiToastTrigger() {
      const { showToast } = useToast();
      return (
        <button onClick={() => {
          showToast('Toast 1', 'info', 0);
          showToast('Toast 2', 'info', 0);
          showToast('Toast 3', 'info', 0);
          showToast('Toast 4', 'info', 0);
        }}>
          Show Many
        </button>
      );
    }

    renderWithProvider(<MultiToastTrigger />);
    fireEvent.click(screen.getByText('Show Many'));
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeLessThanOrEqual(3);
  });

  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation();
    expect(() => render(<ToastTrigger />)).toThrow('useToast must be used within ToastProvider');
    spy.mockRestore();
  });
});
