/**
 * Component Tests: UpgradeBanner
 */
import { render, screen, fireEvent } from '@testing-library/react';
import UpgradeBanner from '@/app/components/UpgradeBanner';

describe('UpgradeBanner Component', () => {
  it('renders when usage is near limit', () => {
    render(<UpgradeBanner used={8} limit={10} />);
    expect(screen.getByText(/You've used 8 of 10 free analyses today/)).toBeInTheDocument();
  });

  it('renders when usage equals limit', () => {
    render(<UpgradeBanner used={10} limit={10} />);
    expect(screen.getByText(/You've used 10 of 10 free analyses today/)).toBeInTheDocument();
  });

  it('does not render when usage is below threshold', () => {
    render(<UpgradeBanner used={5} limit={10} />);
    expect(screen.queryByText(/You've used/)).not.toBeInTheDocument();
  });

  it('shows threshold at limit - 2', () => {
    // used=7, limit=10 → 7 < 10-2=8, should NOT show
    const { rerender } = render(<UpgradeBanner used={7} limit={10} />);
    expect(screen.queryByText(/You've used/)).not.toBeInTheDocument();

    // used=8, limit=10 → 8 >= 8, should show
    rerender(<UpgradeBanner used={8} limit={10} />);
    expect(screen.getByText(/You've used 8 of 10/)).toBeInTheDocument();
  });

  it('has upgrade link pointing to /pricing', () => {
    render(<UpgradeBanner used={9} limit={10} />);
    const link = screen.getByText('Upgrade to Pro');
    expect(link.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('shows upgrade description text', () => {
    render(<UpgradeBanner used={9} limit={10} />);
    expect(screen.getByText(/Upgrade to Pro for unlimited analyses/)).toBeInTheDocument();
  });

  it('has dismiss button with accessible label', () => {
    render(<UpgradeBanner used={9} limit={10} />);
    expect(screen.getByLabelText('Dismiss upgrade banner')).toBeInTheDocument();
  });

  it('hides when dismissed', () => {
    const onDismiss = jest.fn();
    render(<UpgradeBanner used={9} limit={10} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByLabelText('Dismiss upgrade banner'));
    expect(screen.queryByText(/You've used/)).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders progress bar', () => {
    const { container } = render(<UpgradeBanner used={8} limit={10} />);
    const progressBar = container.querySelector('.bg-gradient-to-r.from-primary.to-accent');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar?.getAttribute('style')).toContain('width: 80%');
  });

  it('caps progress at 100%', () => {
    const { container } = render(<UpgradeBanner used={12} limit={10} />);
    const progressBar = container.querySelector('.bg-gradient-to-r.from-primary.to-accent');
    expect(progressBar?.getAttribute('style')).toContain('width: 100%');
  });
});
