import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/app/hooks/useKeyboardShortcuts';
import type { ShortcutDefinition } from '@/app/hooks/useKeyboardShortcuts';

function fireKey(key: string, options: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
}

describe('useKeyboardShortcuts', () => {
  it('calls handler when matching key is pressed', () => {
    const handler = jest.fn();
    const shortcuts: ShortcutDefinition[] = [
      { key: '/', description: 'Focus input', handler },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));
    fireKey('/');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('requires ctrl modifier when specified', () => {
    const handler = jest.fn();
    const shortcuts: ShortcutDefinition[] = [
      { key: 'k', ctrl: true, description: 'Open search', handler },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Without ctrl — should not fire
    fireKey('k');
    expect(handler).not.toHaveBeenCalled();

    // With ctrl — should fire
    fireKey('k', { ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('supports meta key as ctrl alternative', () => {
    const handler = jest.fn();
    renderHook(() => useKeyboardShortcuts([
      { key: 'k', ctrl: true, description: 'Test', handler },
    ]));

    fireKey('k', { metaKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores shortcuts when typing in input by default', () => {
    const handler = jest.fn();
    renderHook(() => useKeyboardShortcuts([
      { key: '/', description: 'Focus', handler },
    ]));

    // Simulate keydown from an input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('fires ctrl shortcuts even in input fields', () => {
    const handler = jest.fn();
    renderHook(() => useKeyboardShortcuts([
      { key: 'Enter', ctrl: true, description: 'Submit', handler, ignoreInInput: false },
    ]));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Ctrl+Enter from input should fire since ctrl shortcuts have special handling
    fireKey('Enter', { ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(input);
  });

  it('cleans up listener on unmount', () => {
    const handler = jest.fn();
    const { unmount } = renderHook(() => useKeyboardShortcuts([
      { key: 'a', description: 'Test', handler },
    ]));

    unmount();
    fireKey('a');
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire when shift is pressed but not expected', () => {
    const handler = jest.fn();
    renderHook(() => useKeyboardShortcuts([
      { key: 'a', description: 'Test', handler },
    ]));

    fireKey('a', { shiftKey: true });
    expect(handler).not.toHaveBeenCalled();
  });
});
