/**
 * Component Tests: Leaderboard
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Leaderboard from '@/app/components/Leaderboard';

const mockEntries = [
  { rank: 1, display_name: 'Alice Kim', job_role: 'Marketing', score: 95, prompt_preview: 'Write a campaign...' },
  { rank: 2, display_name: 'Bob Chen', job_role: 'Engineering', score: 88, prompt_preview: 'Debug this code...' },
  { rank: 3, display_name: 'Charlie D', job_role: 'Design', score: 75, prompt_preview: 'Create a logo...' },
];

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

beforeAll(() => {
  (window as unknown as Record<string, unknown>).IntersectionObserver = jest.fn(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: jest.fn(),
  }));
});

describe('Leaderboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders header', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: mockEntries }),
    });

    render(<Leaderboard />);
    expect(screen.getByText('Weekly Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Top prompt scores this week')).toBeInTheDocument();
  });

  it('shows loading skeletons initially', () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    const { container } = render(<Leaderboard />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders entries after fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: mockEntries }),
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Alice Kim')).toBeInTheDocument();
    });

    expect(screen.getByText('Bob Chen')).toBeInTheDocument();
    expect(screen.getByText('Charlie D')).toBeInTheDocument();
  });

  it('renders scores correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: mockEntries }),
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('95')).toBeInTheDocument();
    });

    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('renders filter tabs', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    render(<Leaderboard />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('changes filter and refetches', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: mockEntries }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: [mockEntries[0]] }) });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Alice Kim')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Marketing'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain('role=Marketing');
  });

  it('shows error state on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText(/Could not load leaderboard/)).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows empty state when no entries', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText(/No entries found/)).toBeInTheDocument();
    });
  });

  it('renders user initials as avatar', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: mockEntries }),
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('AK')).toBeInTheDocument(); // Alice Kim
    });

    expect(screen.getByText('BC')).toBeInTheDocument(); // Bob Chen
  });

  it('shows View Recipe buttons as disabled', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: mockEntries }),
    });

    render(<Leaderboard />);

    await waitFor(() => {
      const buttons = screen.getAllByText('View Recipe');
      buttons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });

  it('retries on Retry button click', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: mockEntries }) });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(screen.getByText('Alice Kim')).toBeInTheDocument();
    });
  });
});
