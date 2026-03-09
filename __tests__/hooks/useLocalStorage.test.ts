import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns stored value if exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('updates localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('updated');
  });

  it('supports functional updater', () => {
    const { result } = renderHook(() => useLocalStorage<number>('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('removes value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'value'));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe('value'); // Falls back to initial
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('handles complex objects', () => {
    const obj = { name: 'test', items: [1, 2, 3] };
    const { result } = renderHook(() => useLocalStorage('obj-key', obj));

    expect(result.current[0]).toEqual(obj);

    const updated = { name: 'updated', items: [4, 5] };
    act(() => {
      result.current[1](updated);
    });

    expect(result.current[0]).toEqual(updated);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('bad-key', 'not-json{{{');
    const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });
});
