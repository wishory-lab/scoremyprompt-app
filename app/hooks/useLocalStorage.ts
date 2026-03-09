'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Type-safe localStorage hook with SSR support and cross-tab sync.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('smp_theme', 'dark');
 *   const [prefs, setPrefs] = useLocalStorage<UserPrefs>('smp_prefs', defaultPrefs);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist to localStorage on change
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(nextValue));
          // Dispatch custom event for same-tab listeners
          window.dispatchEvent(
            new CustomEvent('local-storage-change', { detail: { key, value: nextValue } })
          );
        } catch {
          // localStorage full or unavailable
        }
        return nextValue;
      });
    },
    [key]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {
      // silent fail
    }
  }, [key, initialValue]);

  // Cross-tab sync via storage event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        const newValue = e.newValue ? (JSON.parse(e.newValue) as T) : initialValue;
        setStoredValue(newValue);
      } catch {
        // ignore parse errors
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
