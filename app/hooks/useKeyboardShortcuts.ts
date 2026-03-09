'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutDefinition {
  /** Key to listen for (e.g., '/', 'k', 'Escape') */
  key: string;
  /** Description for help overlay */
  description: string;
  /** Require Ctrl/Cmd modifier */
  ctrl?: boolean;
  /** Require Shift modifier */
  shift?: boolean;
  /** Handler function */
  handler: () => void;
  /** Whether to prevent default browser behavior (default: true) */
  preventDefault?: boolean;
  /** Disable when input/textarea is focused (default: true) */
  ignoreInInput?: boolean;
}

/**
 * Hook to register keyboard shortcuts.
 *
 * Usage:
 *   useKeyboardShortcuts([
 *     { key: '/', description: 'Focus prompt input', handler: () => focusInput() },
 *     { key: 'k', ctrl: true, description: 'Toggle shortcuts help', handler: toggleHelp },
 *   ]);
 */
export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isEditable = target.isContentEditable;
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isEditable;

    for (const shortcut of shortcutsRef.current) {
      const ignoreInInput = shortcut.ignoreInInput !== false;

      // Skip if user is typing in an input and shortcut should be ignored
      if (isInput && ignoreInInput && !shortcut.ctrl) continue;

      // Check key match
      if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) continue;

      // Check modifiers
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (shortcut.ctrl && !ctrlOrMeta) continue;
      if (!shortcut.ctrl && ctrlOrMeta) continue;
      if (shortcut.shift && !e.shiftKey) continue;
      if (!shortcut.shift && e.shiftKey) continue;

      // Execute
      if (shortcut.preventDefault !== false) {
        e.preventDefault();
      }
      shortcut.handler();
      return;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Pre-built shortcuts for the homepage.
 * Pass actual handler references when using.
 */
export function createHomeShortcuts(handlers: {
  focusInput: () => void;
  toggleHelp: () => void;
  analyze: () => void;
  clearInput: () => void;
}): ShortcutDefinition[] {
  return [
    {
      key: '/',
      description: 'Focus prompt input',
      handler: handlers.focusInput,
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Show keyboard shortcuts',
      handler: handlers.toggleHelp,
      ignoreInInput: false,
    },
    {
      key: 'Enter',
      ctrl: true,
      description: 'Analyze prompt',
      handler: handlers.analyze,
      ignoreInInput: false,
    },
    {
      key: 'Escape',
      description: 'Clear / Close',
      handler: handlers.clearInput,
      ignoreInInput: false,
    },
  ];
}
