import { render, screen, fireEvent } from '@testing-library/react';
import KeyboardShortcutsHelp from '@/app/components/KeyboardShortcutsHelp';
import type { ShortcutDefinition } from '@/app/hooks/useKeyboardShortcuts';

const mockShortcuts: ShortcutDefinition[] = [
  { key: '/', description: 'Focus prompt input', handler: jest.fn() },
  { key: 'k', ctrl: true, description: 'Show keyboard shortcuts', handler: jest.fn() },
  { key: 'Escape', description: 'Clear / Close', handler: jest.fn() },
];

describe('KeyboardShortcutsHelp', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <KeyboardShortcutsHelp isOpen={false} onClose={jest.fn()} shortcuts={mockShortcuts} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog when open', () => {
    render(
      <KeyboardShortcutsHelp isOpen={true} onClose={jest.fn()} shortcuts={mockShortcuts} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('displays all shortcuts with descriptions', () => {
    render(
      <KeyboardShortcutsHelp isOpen={true} onClose={jest.fn()} shortcuts={mockShortcuts} />
    );
    expect(screen.getByText('Focus prompt input')).toBeInTheDocument();
    expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Clear / Close')).toBeInTheDocument();
  });

  it('shows key labels correctly', () => {
    render(
      <KeyboardShortcutsHelp isOpen={true} onClose={jest.fn()} shortcuts={mockShortcuts} />
    );
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('Ctrl/⌘')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(
      <KeyboardShortcutsHelp isOpen={true} onClose={onClose} shortcuts={mockShortcuts} />
    );
    fireEvent.click(screen.getByLabelText('Close shortcuts help'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = jest.fn();
    render(
      <KeyboardShortcutsHelp isOpen={true} onClose={onClose} shortcuts={mockShortcuts} />
    );
    // Click backdrop (the first div with aria-hidden)
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has accessible attributes', () => {
    render(
      <KeyboardShortcutsHelp isOpen={true} onClose={jest.fn()} shortcuts={mockShortcuts} />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Keyboard shortcuts');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
