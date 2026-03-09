'use client';

import { useEffect, useRef } from 'react';
import type { ShortcutDefinition } from '@/app/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutDefinition[];
}

function formatKey(shortcut: ShortcutDefinition): string[] {
  const keys: string[] = [];
  if (shortcut.ctrl) {
    // Show ⌘ for Mac hint, Ctrl for others
    keys.push('Ctrl/⌘');
  }
  if (shortcut.shift) {
    keys.push('Shift');
  }

  const keyLabel =
    shortcut.key === '/' ? '/' :
    shortcut.key === 'Escape' ? 'Esc' :
    shortcut.key === 'Enter' ? '↵' :
    shortcut.key.toUpperCase();

  keys.push(keyLabel);
  return keys;
}

/**
 * Modal overlay showing available keyboard shortcuts.
 * Triggered by Ctrl+K.
 */
export default function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsHelpProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-sm bg-surface border border-white/10 rounded-2xl shadow-2xl p-6 outline-none"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            aria-label="Close shortcuts help"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut) => {
            const keys = formatKey(shortcut);
            return (
              <div
                key={`${shortcut.ctrl ? 'ctrl-' : ''}${shortcut.shift ? 'shift-' : ''}${shortcut.key}`}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-400">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {keys.map((k, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-gray-600 text-xs mx-0.5">+</span>}
                      <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-gray-300">
                        {k}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-xs text-gray-600 text-center">
          Press <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400 font-mono">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
