/**
 * Component Tests: OnboardingTour
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import OnboardingTour from '@/app/components/OnboardingTour';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('OnboardingTour Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();

    // Add mock target elements to DOM
    const analyzeEl = document.createElement('div');
    analyzeEl.id = 'analyze';
    analyzeEl.getBoundingClientRect = jest.fn(() => ({
      top: 100, bottom: 200, left: 50, right: 250, width: 200, height: 100,
      x: 50, y: 100, toJSON: jest.fn(),
    }));
    document.body.appendChild(analyzeEl);
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('does not render initially (waits for delay)', () => {
    render(<OnboardingTour />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders after initial delay', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1500); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render if tour was completed', () => {
    localStorageMock.getItem.mockReturnValue('true');
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(2000); });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows first step title', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1800); });
    expect(screen.getByText('Paste Your Prompt')).toBeInTheDocument();
  });

  it('shows step counter 1/3', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1800); });
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('advances to next step on Next click', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1800); });
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Pick Your Role')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('shows "Got it!" on last step', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1800); });

    // Step 1 → 2
    fireEvent.click(screen.getByText('Next'));
    // Step 2 → 3
    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Got it!')).toBeInTheDocument();
    expect(screen.getByText('Get Your Score')).toBeInTheDocument();
  });

  it('dismisses tour and saves to localStorage on Skip', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1800); });

    fireEvent.click(screen.getByText('Skip tour'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('smp_tour_completed', 'true');
  });

  it('dismisses on backdrop click', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1800); });

    // Backdrop has aria-hidden="true"
    const backdrop = document.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('completes tour on last step "Got it!" click', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1800); });

    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Got it!'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('smp_tour_completed', 'true');
  });

  it('has accessible dialog attributes', () => {
    render(<OnboardingTour />);
    act(() => { jest.advanceTimersByTime(1800); });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', expect.stringContaining('Onboarding step 1'));
  });
});
